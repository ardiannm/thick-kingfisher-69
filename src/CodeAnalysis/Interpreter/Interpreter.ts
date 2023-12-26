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
      const InputLine = Promp.question("> ");

      console.clear();

      if (InputLine === "a") {
        console.clear();
        continue;
      }

      if (InputLine === "r") {
        this.Lines.length = 0;
        break;
      }

      if (InputLine === "q") {
        break;
      }

      this.Lines.push(InputLine);

      this.TryCatch(() => {
        const Input = SourceText.From(InputLine);
        const ParserFactory = new Parser(Input);
        const Program = ParserFactory.Parse();
        const ParserTree = SyntaxTree.Print(Program);

        if (Program.Diagnostics.Any()) {
          throw Program.Diagnostics;
        }

        console.log(ParserTree);
        const LowerProgram = this.lowerer.Lower(Program);
        const LowerTree = SyntaxTree.Print(LowerProgram);

        if (Program.ObjectId !== LowerProgram.ObjectId) {
          console.log(LowerTree);
        }

        const Source = "\n".repeat(3) + this.Lines.join("\n");
        console.log(Source);
        const BoundProgram = this.binder.Bind(Program) as BoundProgram;

        if (BoundProgram.Diagnostics.Any()) {
          throw BoundProgram.Diagnostics;
        }

        const Value = this.evaluator.Evaluate(BoundProgram).toString();
        console.log("\n".repeat(1) + Value + "\n".repeat(1));
      });
    }
  }

  private TryCatch(Fn: () => void) {
    try {
      Fn();
    } catch (error) {
      console.log();
      if (error instanceof DiagnosticBag) {
        console.log(error.Report.map((e) => e.Print));
      } else {
        console.log(error);
      }
      console.log();
    }
  }

  private OpenFile(): string {
    const FullPath = path.join(".", "src", "CodeAnalysis", "Interpreter", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
