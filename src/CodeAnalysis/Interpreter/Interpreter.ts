import Promp from "readline-sync";

import { Parser } from "../Parser/Parser";
import { SourceText } from "../Text/SourceText";
import { Evaluator } from "../../Evaluator";
import { BoundScope } from "../Binder/BoundScope";
import { Binder } from "../Binder/Binder";
import { SyntaxTree } from "../Parser/SyntaxTree";
import { RgbColor } from "./RgbColor";
import { Diagnostic } from "../Diagnostics/Diagnostic";
import { Rewriter } from "../Rewriter/Rewriter";

export class Interpreter {
  private Lines = Array<string>();

  public Run() {
    const Environment = new BoundScope();
    const RewriterFactory = new Rewriter();
    const BinderFactory = new Binder(Environment);
    const EvaluatorFactory = new Evaluator(Environment);

    console.clear();

    while (true) {
      const InputLine = Promp.question("> ");

      console.clear();

      if (InputLine === "q") break;

      if (InputLine === "r") {
        this.Lines.length = 0;
        Environment.FactoryReset();
        continue;
      }

      if (InputLine === "a") {
        console.clear();
        continue;
      }

      this.TryCatch(() => {
        const ParserFactory = new Parser(SourceText.From(InputLine));
        const Program = ParserFactory.Parse();
        const ParserTree = SyntaxTree.Print(Program);

        console.log(ParserTree);

        const RewriterProgram = RewriterFactory.Rewrite(Program);
        const RewriterTree = SyntaxTree.Print(RewriterProgram);

        if (Program.ObjectId !== RewriterProgram.ObjectId) {
          console.log(RewriterTree);
        }

        this.Lines.push(InputLine);

        const Source = "\n".repeat(3) + this.Lines.join("\n");
        console.log(RgbColor.Sandstone(Source));

        const BoundProgram = BinderFactory.Bind(Program);
        const Value = EvaluatorFactory.Evaluate(BoundProgram).toString();

        console.log("\n".repeat(1) + RgbColor.Terracotta(Value) + "\n".repeat(1));
      });
    }
  }

  private TryCatch(Fn: () => void) {
    try {
      Fn();
    } catch (error) {
      if (error instanceof Diagnostic) {
        const Message = RgbColor.Terracotta(error.Message);
        console.log(Message);
        return;
      }
      console.log(error);
    }
  }
}
