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

  public Run() {
    console.clear();

    while (true) {
      const InputLine = Promp.question("> ");
      this.Width = Math.max(this.Width, InputLine.length);

      console.clear();

      switch (InputLine.toLowerCase()) {
        case "t":
          this.ShowTrees();
          continue;
        case "a":
          this.ClearLines();
          continue;
        case "r":
          this.CheckResult();
          continue;
      }

      if (InputLine.toLowerCase() === "q") break;

      if (InputLine.trim()) {
        this.Lines.push(InputLine);
      }

      this.TryCatch();
    }
  }

  private TryCatch() {
    try {
      console.log();
      console.log(RgbColor.Azure(this.JoinInputLines));
      console.log();
      this.ShowTrees();
      console.log();
      console.log();
      this.CheckResult();
      console.log();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ShowTrees() {
    try {
      const ParserTree = SyntaxTree.Parse(this.JoinInputLines);
      const RewriterTree = SyntaxTree.Rewrite(this.JoinInputLines);
      console.log(SyntaxTree.Print(ParserTree));
      if (ParserTree.ObjectId === RewriterTree.ObjectId) {
        return;
      }
      console.log();
      console.log();
      console.log(SyntaxTree.Print(RewriterTree));
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private CheckResult() {
    try {
      var Value = SyntaxTree.Evaluate(this.JoinInputLines) + "";
      const RewriterValue = SyntaxTree.EvaluateRewriter(this.JoinInputLines) + "";
      if (RewriterValue !== Value) Value += " " + "(" + RewriterValue + ")";
      console.log();
      console.log();
      console.log(RgbColor.Azure("Evaluator") + "  " + RgbColor.Cerulean(Value));
      console.log();
      console.log();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.SourceCodeIsEmpty) this.Lines.push("# " + this.Lines.pop());
      const Message = RgbColor.Cerulean(Diagnostic.Message);
      console.log(Message);
      console.log();
    } else {
      console.log(error);
    }
  }

  private get JoinInputLines() {
    return this.Lines.join("\n");
  }

  private ClearLines() {
    this.Lines.length = 0;
    console.clear();
  }

  private LoadSource(): string {
    const FullPath = path.join(".", "src", "IO", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
