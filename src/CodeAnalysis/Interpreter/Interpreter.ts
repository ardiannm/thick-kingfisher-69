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
  public Run() {
    console.clear();

    const Environment = new BoundScope();
    const RewriterFactory = new Rewriter();
    const BinderFactory = new Binder(Environment);
    const EvaluatorFactory = new Evaluator(Environment);

    while (true) {
      console.log();

      const InputLine = Promp.question("> ");

      console.clear();

      if (InputLine === "q") break;

      if (InputLine === "a") {
        console.clear();
        continue;
      }

      const ParserFactory = new Parser(SourceText.From(InputLine));

      this.TryCatch(() => {
        const Program = ParserFactory.Parse();
        const ParseTree = SyntaxTree.Print(Program);

        console.log(ParseTree);

        const RewritternProgram = RewriterFactory.Rewrite(Program);
        const RewrittenTree = SyntaxTree.Print(RewritternProgram);

        console.log(RewrittenTree);

        const BoundProgram = BinderFactory.Bind(Program);
        const Value = EvaluatorFactory.Evaluate(BoundProgram).toString();

        console.log(RgbColor.Cerulean(Value));
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
