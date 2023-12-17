import Promp from "readline-sync";

import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../Diagnostics/Diagnostic";
import { SyntaxTree } from "../Parser/SyntaxTree";
import { Evaluator } from "../../Evaluator";
import { DiagnosticCode } from "../Diagnostics/DiagnosticCode";
import { BoundNode } from "../Binder/BoundNode";
import { SyntaxNode } from "../Parser/SyntaxNode";
import { Color } from "./Color";
import { RgbColor } from "./RgbColor";

export class Interpreter {
  // private Env = new Environment();
  private Buffer = new Array<string>();
  private Width = 0;

  private LoadSource(): string {
    const FullPath = path.join(".", "src", "IO", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }

  Run() {
    console.clear();

    while (true) {
      const InputLine = Promp.question("> ");
      this.Width = Math.max(this.Width, InputLine.length);
      console.clear();

      switch (InputLine.toLowerCase()) {
        case "tree":
          this.ShowTree();
          continue;
        case "reset":
          this.ResetBuffer();
          continue;
      }

      if (InputLine.toLowerCase() === "q") break;

      if (InputLine.toLowerCase() === "a") {
        this.Buffer.length = 0;
        console.clear();
        continue;
      }

      if (InputLine.trim()) {
        this.Buffer.push(InputLine);
      }

      try {
        console.clear();
        console.log(Interpreter.Color("----------------------- REWRITER ----------------------------------", Color.Terracotta));
        this.ShowTree();

        // this.Evaluate();
      } catch (error) {
        this.ErrorHandler(error as Error);
      }
    }
  }

  private ResetBuffer() {
    this.Buffer.length = 0;
    console.clear();
  }

  private ShowTree() {
    try {
      const Tree = Interpreter.Print(SyntaxTree.Bind(this.Input));
      this.LoggerLog(Tree);
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ClearScreen() {
    console.clear();
    this.Buffer.pop();
    const Message = this.Buffer.length > 0 ? "Interpreter: Line " + (this.Buffer.length + 1) + " removed." : "";
    this.LoggerLog(this.Input, Message);
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.ProgramIsEmpty) this.Buffer.push("# " + this.Buffer.pop());
      this.LoggerLog(this.Input, Interpreter.Color(Diagnostic.Message, Color.Teal));
    } else {
      console.log(error);
    }
  }

  private LoggerLog(Str: string = "", Message?: string) {
    console.log(Str);
    if (Message) console.log("\n" + Message);
    console.log();
    return Str + "\n";
  }

  private get Input() {
    return this.Buffer.join("\n");
  }

  static Print<T>(Node: T, Indent = ""): string {
    var Text = "";
    if (typeof Node === "string") {
      Text += this.Color(`${Node}`, Color.Sage);
      return Text;
    }
    if (typeof Node === "number") {
      Text += this.Color(`${Node}`, Color.Sage);
      return Text;
    }
    if (Node instanceof Set) {
      return this.Print(Array.from(Node));
    }
    if (Node instanceof Array) {
      for (const Item of Node) {
        Text += this.Print(Item, Indent) + " ";
      }
      return Text;
    }
    if (Node instanceof BoundNode || Node instanceof SyntaxNode) {
      for (const [Property, Branch] of Object.entries(Node)) {
        if (Property === "Kind") {
          Text += "\n" + Indent + Indent + " " + this.Color("-" + Node.Kind, Color.Azure);
        } else {
          Text += "\n" + Indent + Indent + " " + "  " + this.Color(Property, Color.Moss) + " " + this.Print(Branch, Indent + " ");
        }
      }
      return Text;
    }
    return Text;
  }

  static Color(Text: string, Hex: string): string {
    return this.HexToColorCode(Hex) + Text + "\x1b[0m";
  }

  private static HexToRgb(Hex: string): RgbColor {
    const BingInt = parseInt(Hex.substring(1), 16);
    const r = (BingInt >> 16) & 255;
    const g = (BingInt >> 8) & 255;
    const b = BingInt & 255;
    return new RgbColor(r, g, b);
  }

  static HexToColorCode(Hex: string) {
    const RgbColor = this.HexToRgb(Hex);
    return `\x1b[38;2;${RgbColor.r};${RgbColor.g};${RgbColor.b}m`;
  }
}
