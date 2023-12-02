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
  const ParserFactory = new Parser(Input, Logger);
  const Tree = ParserFactory.Parse();

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    Logger.Log();
    continue;
  }

  if (ShowTree) Logger.Log(Tree);

  if (Logger.Any()) {
    Logger.Show();
  } else {
    try {
      const BoundTree = BinderFactory.Bind(Tree);
      Logger.Log(BoundTree);
      EvaluatorFactory.Evaluate(BoundTree);
    } catch (error) {
      Logger.Log((error as Diagnostic).Message);
    }
  }
  Logger.Clear();
}
