import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";
import { Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";
import { Diagnostic } from "./src/CodeAnalysis/Diagnostics/Diagnostic";
import { Binder } from "./src/Binder";

const Logger = new Diagnostics();
const Environment_ = new Environment(Logger);
const Evaluator_ = new Evaluator(Environment_, Logger);

var ShowTree = false;

while (true) {
  const Input = Prompt("> ");
  const Syntax = new Parser(Input, Logger);
  const Tree = Syntax.Parse();
  const BoundTree = new Binder(Logger);

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
      Logger.Log(BoundTree.Bind(Tree));
      // Logger.Log(Evaluator_.Evaluate(Tree));
    } catch (error) {
      Logger.Log((error as Diagnostic).Message);
    }
  }
  Logger.Clear();
}
