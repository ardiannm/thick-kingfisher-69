import Promp from "readline-sync";

import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../Diagnostics/Diagnostic";
import { SyntaxTree } from "../Syntax/SyntaxTree";
import { Evaluator } from "../../Evaluator";
import { DiagnosticCode } from "../Diagnostics/DiagnosticCode";
import { BoundNode } from "../Binding/BoundNode";
import { SyntaxNode } from "../Syntax/SyntaxNode";
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
        case "cls":
          this.ClearScreen();
          continue;
        case "tree":
          this.ShowTree();
          continue;
        case "reset":
          this.ResetBuffer();
          continue;
      }

      if (InputLine.toLowerCase() === "q") break;

      if (InputLine.trim()) {
        this.Buffer.push(InputLine);
      }

      try {
        this.Evaluate();
      } catch (error) {
        this.ErrorHandler(error as Error);
      }
    }
  }

  private Evaluate() {
    const BoundTree = SyntaxTree.Bind(this.Input);
    this.Print(this.Input);
    const Evaluation = new Evaluator(BoundTree.Scope).Evaluate(BoundTree);
    const Value = JSON.stringify(Evaluation);
    this.Print(Interpreter.Color(Value, Color.Sage));
  }

  private ResetBuffer() {
    this.Buffer.length = 0;
    console.clear();
  }

  private ShowTree() {
    try {
      this.Print(Interpreter.Print(SyntaxTree.Bind(this.Input)));
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ClearScreen() {
    console.clear();
    this.Buffer.pop();
    const Message = this.Buffer.length > 0 ? "Interpreter: Line " + (this.Buffer.length + 1) + " removed." : "";
    this.Print(this.Input, Message);
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.ProgramIsEmpty) this.Buffer.push("# " + this.Buffer.pop());
      this.Print(this.Input, Interpreter.Color(Diagnostic.Message, Color.Teal));
    } else {
      console.log(error);
    }
  }

  private Print(Str: string = "", Message?: string) {
    console.log(Str);
    if (Message) console.log("\n" + Message);
    console.log();
    return Str + "\n";
  }

  private get Input() {
    return this.Buffer.join("\n");
  }

  public static Print<T>(Node: T, Indent = ""): string {
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

  public static HexToColorCode(Hex: string) {
    const RgbColor = this.HexToRgb(Hex);
    return `\x1b[38;2;${RgbColor.r};${RgbColor.g};${RgbColor.b}m`;
  }
}
