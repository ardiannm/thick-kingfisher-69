import prompt from "prompt-sync";

import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";

const report = (tree: Object = "") => console.log(`${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}`);

var ShowTree = true;
var ShowValue = true;

const Interpreter = new Evaluator();

while (true) {
  const Input = prompt({ sigint: true })("> ");

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    report();
    console.log(ShowTree ? "\tShowing Tree" : "\tNot Showing Tree");
    report();
    continue;
  }

  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();

  if (Syntax.Diagnostics.length > 0) {
    report();
    for (const Message of Syntax.Diagnostics) report(Message);
    report();
    continue;
  }

  if (ShowTree) report(Tree);
  if (ShowValue) report(Interpreter.Evaluate(Tree));

  console.log();
}
