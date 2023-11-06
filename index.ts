import prompt from "prompt-sync";
import { Parser } from "./src/Parser";

const report = (tree: Object) => console.log("\n" + JSON.stringify(tree, undefined, 3) + "\n");

while (true) {
  const input = prompt({ sigint: true })("> ");
  const parser = new Parser(input);
  const tree = parser.parse();
  report(tree);
}
