import prompt from "prompt-sync";
import { Parser } from "./src/Parser";

var showTree = true;
const report = (tree: Object) => console.log("\n" + JSON.stringify(tree, undefined, 2) + "\n");

while (true) {
  const input = prompt({ sigint: true })("> ");

  if (input.trim() === "tree") {
    showTree = !showTree;
    console.log();
    console.log(showTree ? "\tShowing Tree" : "\tNot Showing Tree");
    console.log();
    continue;
  }

  const tree = new Parser(input).Parse();

  if (showTree) report(tree);
  else report("No Evaluator Has Been Implemented Yet");

  console.log();
}
