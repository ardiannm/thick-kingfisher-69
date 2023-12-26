import Promp from "readline-sync";

import * as fs from "fs";
import * as path from "path";

import { Parser } from "../Parser/Parser";
import { SourceText } from "../../SourceText";
import { Evaluator } from "../../Evaluator";
import { Environment } from "../../Environment";
import { Binder } from "../Binder/Binder";
import { SyntaxTree } from "../Parser/SyntaxTree";
import { Lowerer } from "../Lowerer/Lowerer";
import { BoundProgram } from "../Binder/BoundProgram";

export class Interpreter {
  private lines = Array<string>();
  private environment = new Environment();
  private lowerer = new Lowerer();
  private binder = new Binder(this.environment);
  private evaluator = new Evaluator(this.environment);

  public Run() {
    console.clear();

    while (true) {
      console.log();

      const InputLine = Promp.question("> ");

      console.clear();

      if (InputLine === "a") {
        console.clear();
        continue;
      }

      if (InputLine === "r") {
        this.lines.length = 0;
        this.environment.Diagnostics.Clear();
        this.evaluator.Diagnostics.Clear();
        continue;
      }

      if (InputLine === "q") {
        break;
      }

      this.lines.push(InputLine);

      const parser = new Parser(SourceText.From(InputLine));
      const Program = parser.Parse();

      const ParserTree = SyntaxTree.Print(Program);

      console.log(ParserTree);
      console.log();

      if (Program.Diagnostics.Any()) {
        console.log(Program.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const LowerProgram = this.lowerer.Lower(Program);

      if (Program.ObjectId !== LowerProgram.ObjectId) console.log(SyntaxTree.Print(LowerProgram));

      const Source = "\n".repeat(3) + this.lines.join("\n");

      console.log(Source);
      console.log();

      const BoundProgram = this.binder.Bind(Program) as BoundProgram;

      if (BoundProgram.Diagnostics.Any()) {
        console.log(BoundProgram.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const Value = this.evaluator.Evaluate(BoundProgram);

      if (this.evaluator.Diagnostics.Any()) {
        console.log(this.evaluator.Diagnostics.Show.map((e) => e.Print));
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
