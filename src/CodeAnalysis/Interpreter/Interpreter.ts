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
          this.Evaluate();
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
      this.ShowTrees();
      this.Evaluate();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ShowTrees() {
    try {
      const ParserTree = SyntaxTree.Parse(this.JoinInputLines);
      const RewriterTree = SyntaxTree.Rewrite(this.JoinInputLines);
      console.log(SyntaxTree.Print(ParserTree));
      if (ParserTree.ObjectId !== RewriterTree.ObjectId) {
        console.log();
        console.log(SyntaxTree.Print(RewriterTree));
      }
      console.log();
      console.log(RgbColor.Azure("Expression"));
      console.log(RgbColor.Cerulean(this.JoinInputLines));
      if (ParserTree.ObjectId !== RewriterTree.ObjectId) {
        console.log();
        console.log(RgbColor.Azure("RewrittenExpression"));
        console.log(RgbColor.Cerulean(RewriterTree.SourceText));
      }
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private Evaluate() {
    try {
      var Value = SyntaxTree.Evaluate(this.JoinInputLines) + "";
      const RewriterValue = SyntaxTree.EvaluateRewriter(this.JoinInputLines) + "";
      if (RewriterValue !== Value) Value += " " + "(" + RewriterValue + ")";
      console.log();
      console.log(RgbColor.Azure("Evaluator"));
      console.log(RgbColor.Cerulean(Value));
      console.log();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.SourceCodeIsEmpty) this.Lines.push("# " + this.Lines.pop());
      console.log();
      console.log(RgbColor.Cerulean(Diagnostic.Message));
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
