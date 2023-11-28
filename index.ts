import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";

const report = (tree: Object = "") => console.log(`${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}`);

var ShowTree = false;

const environment = new Environment();
const evaluator = new Evaluator(environment);

while (true) {
  const Input = Prompt("> ");
  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    report();
    continue;
  }

  if (ShowTree) {
    report();
    report(Tree);
  }

  if (Syntax.Diagnostics.length > 0) {
    report();
    for (const Message of Syntax.Diagnostics) report(Message);
  } else {
    report();
    try {
      report(evaluator.Evaluate(Tree));
    } catch (error) {
      report(error);
    }
  }

  report();
}
