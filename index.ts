import prompt from "prompt-sync";
import { Parser } from "./src/Parser";

var showTree = true;
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
  else report("No Evaluator Has Been Implemented Yet");

  console.log();
}
