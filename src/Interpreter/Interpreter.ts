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
  private lines = Array<string>();
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

      if (inputLine === "a") {
        console.clear();
        continue;
      }

      if (inputLine === "r") {
        this.lines.length = 0;
        this.diagnostics.Clear();
        continue;
      }

      if (inputLine === "q") {
        break;
      }

      this.lines.push(inputLine);

      const text = SourceText.From(inputLine);
      const parser = new Parser(text, this.diagnostics);
      const Program = parser.Parse();

      const ParserTree = SyntaxTree.Print(Program);

      console.log(ParserTree);
      console.log();

      if (this.diagnostics.Any()) {
        console.log(this.diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const LowerProgram = this.lowerer.Lower(Program);

      if (Program.ObjectId !== LowerProgram.ObjectId) console.log(SyntaxTree.Print(LowerProgram));

      const Source = "\n".repeat(3) + this.lines.join("\n");

      console.log(Source);
      console.log();

      const BoundProgram = this.binder.Bind(Program) as BoundProgram;

      if (this.diagnostics.Any()) {
        console.log(this.diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const Value = this.evaluator.Evaluate(BoundProgram);

      if (this.diagnostics.Any()) {
        console.log(this.diagnostics.Show.map((e) => e.Print));
        continue;
      }

      console.log("\n".repeat(1) + Value + "\n".repeat(1));
    }
  }

  private OpenFile(): string {
    const FullPath = path.join(".", "src", "CodeAnalysis", "Interpreter", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
