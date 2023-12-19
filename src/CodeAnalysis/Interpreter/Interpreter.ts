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
        case "t":
          this.ShowRewrittenTree();
          continue;
        case "a":
          this.ClearLines();
          continue;
        case "r":
          this.CheckTreeResults();
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
      console.log(RgbColor.Sage("Interperter: showing result for:"));
      console.log();
      this.ShowParseTree();
      console.log();
      this.ShowRewrittenTree();
      console.log();
      this.CheckTreeResults();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private CheckTreeResults() {
    try {
      const Parser = "parser  " + SyntaxTree.Evaluate(this.Input);
      const Rewriter = "rewriter  " + SyntaxTree.EvaluateRewritten(this.Input);
      const ViewParser = RgbColor.Sage(Parser);
      const ViewRewriter = RgbColor.Sage(Rewriter);
      console.log(ViewParser);
      console.log(ViewRewriter);
      console.log();
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ClearLines() {
    this.Lines.length = 0;
    console.clear();
  }

  private ShowRewrittenTree() {
    try {
      const Tree = SyntaxTree.Print(SyntaxTree.Rewrite(this.Input));
      console.log(RgbColor.Sage(this.Input));
      console.log();
      console.log(Tree);
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ShowParseTree() {
    try {
      const Tree = SyntaxTree.Print(SyntaxTree.Parse(this.Input));
      console.log(RgbColor.Sage(this.Input));
      console.log();
      console.log(Tree);
    } catch (error) {
      this.ErrorHandler(error as Error);
    }
  }

  private ErrorHandler(error: Error) {
    if (error instanceof Diagnostic) {
      const Diagnostic = error as Diagnostic;
      if (Diagnostic.Code !== DiagnosticCode.ProgramIsEmpty) this.Lines.push("# " + this.Lines.pop());
      const Message = RgbColor.Sage(Diagnostic.Message);
      console.log(Message);
      console.log();
    } else {
      console.log(error);
    }
  }

  private get Input() {
    return this.Lines.join("\n");
  }
}
