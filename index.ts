import prompt from "prompt-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";

var showTree = true;
const evaluator = new Evaluator();
const report = (tree: Object) => console.log("\n" + JSON.stringify(tree, undefined, 3) + "\n");

while (true) {
  const input = prompt({ sigint: true })("> ");

  if (input.trim() === "tree") {
    showTree = !showTree;
    console.log();
    console.log(showTree ? "\tshowing tree" : "\tnot showing tree");
    console.log();
    continue;
  }

  const tree = new Parser(input).Parse();

  if (showTree) report(tree);
  else report(evaluator.Evaluate(tree));

  console.log();
}
