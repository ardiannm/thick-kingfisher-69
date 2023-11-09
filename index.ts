import prompt from "prompt-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { SyntaxToken } from "./src/Syntax/SyntaxToken";
import { SyntaxKind } from "./src/Syntax/SyntaxKind";
import { Lexer } from "./src/Lexer";

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
  const tree = new Parser(input).parse();

  if (showTree) report(tree);
  else report(evaluator.evaluate(tree));

  console.log();
}
