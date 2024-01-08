import { Binder } from "./CodeAnalysis/Binder/Binder";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { Parser } from "./CodeAnalysis/Parser/Parser";
import { Program } from "./CodeAnalysis/Parser/Program";
import { EvaluatedProgram } from "./EvaluatedProgram";
import { Evaluator } from "./Evaluator";
import { SourceText } from "./Text/SourceText";

export class Interpreter {
  private binder = new Binder();
  private evaluator = new Evaluator();

  private GetLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  Parse(text: string): Program {
    const parser = new Parser(SourceText.From(text));
    return parser.Parse();
  }

  Bind(text: string): BoundProgram {
    return this.binder.Bind(this.Parse(text)) as BoundProgram;
  }

  Evaluate(text: string): EvaluatedProgram {
    return this.evaluator.Evaluate(this.Bind(text));
  }

  ParseName(row: number, column: number) {
    return this.GetLetter(column) + row;
  }

  GetCell(Name: string) {
    return this.binder.Scope.GetCell(Name);
  }
}
