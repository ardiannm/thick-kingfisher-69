import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";

const report = (tree: Object = "") => console.log(`${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}`);

const environment = new Environment();
const evaluator = new Evaluator(environment);

while (true) {
  const Input = Prompt("> ");
  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();

  report(Tree);

  if (Syntax.Diagnostics.length > 0) {
    report();
    for (const Message of Syntax.Diagnostics) report(Message);
  } else {
    report();
    report(evaluator.Evaluate(Tree));
  }

  report();
}
