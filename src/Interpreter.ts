import { BoundScope } from "./BoundScope";
import { Binder } from "./CodeAnalysis/Binder/Binder";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { Parser } from "./CodeAnalysis/Parser/Parser";
import { Program } from "./CodeAnalysis/Parser/Program";
import { Evaluator } from "./Evaluator";
import { SourceText } from "./Text/SourceText";

export class Interpreter {
  private binder = new Binder();
  private evaluator = new Evaluator();

  Parse(text: string): Program {
    const parser = new Parser(SourceText.From(text));
    return parser.Parse();
  }

  Bind(text: string): BoundProgram {
    return this.binder.Bind(this.Parse(text)) as BoundProgram;
  }

  Evaluate(text: string) {
    return this.evaluator.Evaluate(this.Bind(text));
  }
}
