import Promp from "readline-sync";

import * as fs from "fs";
import * as path from "path";

import { Parser } from "../Parser/Parser";
import { SourceText } from "../../SourceText";
import { Evaluator } from "../../Evaluator";
import { Environment } from "../../Environment";
import { Binder } from "../Binder/Binder";
import { SyntaxTree } from "../Parser/SyntaxTree";
import { RgbColor } from "./RgbColor";
import { Diagnostic } from "../../Diagnostic";
import { Lowerer } from "../Lowerer/Lowerer";
import { DiagnosticBag } from "../../DiagnosticBag";
import { BoundProgram } from "../Binder/BoundProgram";

export class Interpreter {
  private Lines = Array<string>();

  public Run() {
    const Env = new Environment();
    const LowererFactory = new Lowerer();
    const BinderFactory = new Binder(Env);
    const EvaluatorFactory = new Evaluator(Env);

    console.clear();

    while (true) {
      const InputLine = Promp.question("> ");
      console.clear();

      if (InputLine === "q") {
        break;
      }

      if (InputLine === "a") {
        console.clear();
        continue;
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

        const LowerProgram = LowererFactory.Lower(Program);
        const LowerTree = SyntaxTree.Print(LowerProgram);

        if (Program.ObjectId !== LowerProgram.ObjectId) {
          console.log(LowerTree);
        }

        const Source = "\n".repeat(3) + this.Lines.join("\n");
        console.log(RgbColor.Terracotta(Source));

        const BoundProgram = BinderFactory.Bind(Program) as BoundProgram;

        if (BoundProgram.Diagnostics.Any()) {
          console.log(BoundProgram.Diagnostics.Report);
          BoundProgram.Diagnostics.Clear();
        } else {
          const Value = EvaluatorFactory.Evaluate(BoundProgram).toString();
          console.log("\n".repeat(1) + RgbColor.Terracotta(Value) + "\n".repeat(1));
        }
      });
    }
  }

  private TryCatch(Fn: () => void) {
    try {
      Fn();
    } catch (error) {
      console.log();
      if (error instanceof Diagnostic) {
        const Message = RgbColor.Terracotta(error.Message);
        console.log(Message);
      } else if (error instanceof DiagnosticBag) {
        for (const Diagnostic of error.Report) {
          console.log(RgbColor.Sandstone(Diagnostic.Message));
        }
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
