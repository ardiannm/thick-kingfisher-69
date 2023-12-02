import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";
import { Diagnostic } from "./src/CodeAnalysis/Diagnostics/Diagnostic";
import { Binder } from "./src/Binder";
import { Evaluator } from "./src/Evaluator";

const Logger = new Diagnostics();
const BinderFactory = new Binder(Logger);
const EvaluatorFactory = new Evaluator(Logger);

var ShowTree = false;

while (true) {
  const Input = Prompt("> ");

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    Logger.Log();
    continue;
  }

  const ParserFactory = new Parser(Input, Logger);
  const Tree = ParserFactory.Parse();

  if (Logger.Any()) {
    Logger.Show();
  } else {
    try {
      const BoundTree = BinderFactory.Bind(Tree);
      if (ShowTree) Logger.Log(BoundTree);
      const Value = EvaluatorFactory.Evaluate(BoundTree);
      Logger.Log(Value);
      EvaluatorFactory.ReportStats();
    } catch (error) {
      Logger.Log((error as Diagnostic).Message);
    }
  }
  Logger.Clear();
}
