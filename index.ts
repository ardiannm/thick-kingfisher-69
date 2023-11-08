import prompt from "prompt-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";

const report = (tree: Object) => console.log("\n" + JSON.stringify(tree, undefined, 3) + "\n");

const evaluator = new Evaluator();

var showTree = false;

while (true) {
  const input = prompt({ sigint: true })("> ");
  if (input.trim() === "tree") {
    showTree = !showTree;
    console.log();
    console.log(showTree ? "\tShowing tree" : "\tNot showing tree");
    console.log();
    continue;
  }
  const parser = new Parser(input);
  const tree = parser.parse();
  if (showTree) report(tree);
  else report(evaluator.evaluate(tree));
}
