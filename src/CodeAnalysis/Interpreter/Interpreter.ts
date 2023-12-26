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
import { DiagnosticBag } from "../../DiagnosticBag";
import { BoundProgram } from "../Binder/BoundProgram";

export class Interpreter {
  private Lines = Array<string>();
  private Env = new Environment();
  private lowerer = new Lowerer();
  private binder = new Binder(this.Env);
  private evaluator = new Evaluator(this.Env);

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
        this.Lines.length = 0;
        continue;
      }

      if (InputLine === "q") {
        break;
      }

      this.Lines.push(InputLine);

      const parser = new Parser(SourceText.From(InputLine));
      const Program = parser.Parse();
      const ParserTree = SyntaxTree.Print(Program);

      if (Program.Diagnostics.Any()) {
        console.log(Program.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      console.log(ParserTree);

      const LowerProgram = this.lowerer.Lower(Program);

      if (Program.ObjectId !== LowerProgram.ObjectId) console.log(SyntaxTree.Print(LowerProgram));

      const Source = "\n".repeat(3) + this.Lines.join("\n");

      console.log(Source);

      const BoundProgram = this.binder.Bind(Program) as BoundProgram;

      if (BoundProgram.Diagnostics.Any()) {
        console.log(BoundProgram.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const Value = this.evaluator.Evaluate(BoundProgram);
      console.log("\n".repeat(1) + Value + "\n".repeat(1));
    }
  }

  private OpenFile(): string {
    const FullPath = path.join(".", "src", "CodeAnalysis", "Interpreter", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
