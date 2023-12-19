import Promp from "readline-sync";

import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../Diagnostics/Diagnostic";
import { SyntaxTree } from "../Parser/SyntaxTree";
import { DiagnosticCode } from "../Diagnostics/DiagnosticCode";
import { RgbColor } from "./RgbColor";

export class Interpreter {
  private Lines = new Array<string>();
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
        case "a":
          this.ClearLines();
          continue;
        case "check":
          this.CheckTreeResults();
          continue;
      }

      if (InputLine.toLowerCase() === "q") break;

      if (InputLine.trim()) {
        this.Lines.push(InputLine);
      }

      try {
        console.log();
        this.ShowTree();
        console.log();
        this.CheckTreeResults();
      } catch (error) {
        this.ErrorHandler(error as Error);
      }
    }
  }

  private CheckTreeResults() {
    try {
      const Print = "parser    " + SyntaxTree.Evaluate(this.Input) + "\nrewriter    " + SyntaxTree.EvaluateRewritten(this.Input);
      const View = RgbColor.Sage(Print);
      console.log();
      console.log(View);
      console.log();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ClearLines() {
    this.Lines.length = 0;
    console.clear();
  }

  private ShowTree() {
    try {
      const Tree = SyntaxTree.Print(SyntaxTree.Rewrite(this.Input));
      console.clear();
      console.log(RgbColor.Sage(this.Input));
      this.LoggerLog(Tree);
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.ProgramIsEmpty) this.Lines.push("# " + this.Lines.pop());
      this.LoggerLog(RgbColor.Sage(this.Input), RgbColor.Sage(Diagnostic.Message));
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
    return this.Lines.join("\n");
  }
}
