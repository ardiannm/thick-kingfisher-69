import prompt from "prompt-sync";

import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";

const report = (tree: Object) => console.log("\n" + `${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}` + "\n");

var ShowTree = true;
var ShowValue = true;

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

  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();

  for (const Message of Syntax.Diagnostics) report(Message);

  if (Syntax.Diagnostics.length > 0) continue;
  if (ShowTree) report(Syntax);
  if (ShowValue) report(Interpreter.Evaluate(Tree));

  console.log();
}
