import prompt from "prompt-sync";

import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";

var ShowTree = true;
var ShowValue = true;
const report = (tree: Object) => console.log("\n" + JSON.stringify(tree, undefined, 2) + "\n");

const Interpreter = new Evaluator();

while (true) {
  const Input = prompt({ sigint: true })("> ");

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    console.log();
    console.log(ShowTree ? "\tShowing Tree" : "\tNot Showing Tree");
    console.log();
    continue;
  }

  const Tree = new Parser(Input).Parse();

  if (ShowTree) report(Tree);
  if (ShowValue) report(Interpreter.Evaluate(Tree));

  console.log();
}
