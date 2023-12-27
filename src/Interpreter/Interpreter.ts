import Promp from "readline-sync";
import * as fs from "fs";
import * as path from "path";

import { Parser } from "../CodeAnalysis/Parser/Parser";
import { SourceText } from "../SourceText";
import { Evaluator } from "../Evaluator";
import { BoundScope } from "../BoundScope";
import { Binder } from "../CodeAnalysis/Binder/Binder";
import { SyntaxTree } from "../CodeAnalysis/Parser/SyntaxTree";
import { Lowerer } from "../CodeAnalysis/Lowerer/Lowerer";
import { BoundProgram } from "../CodeAnalysis/Binder/BoundProgram";
import { Program } from "../CodeAnalysis/Parser/Program";

export class Interpreter {
  private Lines = new Array<string>();
  private Environment = new BoundScope();
  private Lower = new Lowerer();
  private Bind = new Binder(this.Environment);
  private Evaluate = new Evaluator(this.Environment);

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

      switch (inputLine) {
        case "a":
          console.clear();
          continue;
        case "r":
          this.Lines = new Array<string>();
          this.Bind.Diagnostics.ClearDiagnostics();
          continue;
      }

      this.Lines.push(inputLine);
      const text = SourceText.From(inputLine);
      const Program = new Parser(text).Parse();
      const ParserTree = SyntaxTree.Print(Program);

      console.log(ParserTree);
      console.log();

      if (Program.Diagnostics.Any()) {
        console.log(Program.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const LowerProgram = this.Lower.Lower(Program) as Program;

      if (Program.ObjectId !== LowerProgram.ObjectId) {
        console.log(SyntaxTree.Print(LowerProgram));
      }

      if (LowerProgram.Diagnostics.Any()) {
        console.log(LowerProgram.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const Source = "\n".repeat(3) + this.Lines.join("\n");

      console.log(Source);
      console.log();

      const BoundProgram = this.Bind.Bind(Program) as BoundProgram;

      if (BoundProgram.Diagnostics.Any()) {
        console.log(BoundProgram.Diagnostics.Show.map((e) => e.Print));
        continue;
      }

      const Value = this.Evaluate.Evaluate(BoundProgram);
      console.log("\n".repeat(1) + Value + "\n".repeat(1));
    }
  }

  private OpenFile(): string {
    const FullPath = path.join(".", "src", "CodeAnalysis", "Interpreter", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
