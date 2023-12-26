import Promp from "readline-sync";
import * as fs from "fs";
import * as path from "path";

import { Parser } from "../CodeAnalysis/Parser/Parser";
import { SourceText } from "../SourceText";
import { Evaluator } from "../Evaluator";
import { Environment } from "../Environment";
import { Binder } from "../CodeAnalysis/Binder/Binder";
import { SyntaxTree } from "../CodeAnalysis/Parser/SyntaxTree";
import { Lowerer } from "../CodeAnalysis/Lowerer/Lowerer";
import { BoundProgram } from "../CodeAnalysis/Binder/BoundProgram";
import { DiagnosticBag } from "../DiagnosticBag";
import { DiagnosticPhase } from "../DiagnosticPhase";

export class Interpreter {
  private lines = new Array<string>();
  private diagnostics = new DiagnosticBag(DiagnosticPhase.Interpreter);
  private environment = new Environment(this.diagnostics);
  private lowerer = new Lowerer();
  private binder = new Binder(this.environment, this.diagnostics);
  private evaluator = new Evaluator(this.environment, this.diagnostics);

  public Run() {
    console.clear();

    while (true) {
      console.log();
      const inputLine = Promp.question("> ");
      console.clear();

      if (inputLine === "q") {
        console.clear();
        break;
      }

      if (this.HandleSpecialInput(inputLine)) {
        continue;
      }

      this.lines.push(inputLine);
      const text = SourceText.From(inputLine);
      const Program = new Parser(text, this.diagnostics).Parse();
      const ParserTree = SyntaxTree.Print(Program);

      console.log(ParserTree);
      console.log();

      if (this.HandleDiagnostics()) {
        continue;
      }

      const LowerProgram = this.lowerer.Lower(Program);

      if (Program.ObjectId !== LowerProgram.ObjectId) {
        console.log(SyntaxTree.Print(LowerProgram));
      }

      const Source = "\n".repeat(3) + this.lines.join("\n");

      console.log(Source);
      console.log();

      const BoundProgram = this.binder.Bind(Program) as BoundProgram;

      if (this.HandleDiagnostics()) {
        continue;
      }

      const Value = this.evaluator.Evaluate(BoundProgram);

      if (this.HandleDiagnostics()) {
        continue;
      }

      console.log("\n".repeat(1) + Value + "\n".repeat(1));
    }
  }

  private HandleSpecialInput(input: string): boolean {
    switch (input) {
      case "a":
        console.clear();
        return true;
      case "r":
        this.lines.length = 0;
        this.diagnostics.Clear();
        return true;
      default:
        return false;
    }
  }

  private HandleDiagnostics(): boolean {
    if (this.diagnostics.Any()) {
      console.log(this.diagnostics.Show.map((e) => e.Print));
      return true;
    }
    return false;
  }

  private OpenFile(): string {
    const FullPath = path.join(".", "src", "CodeAnalysis", "Interpreter", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
