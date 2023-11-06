import prompt from "prompt-sync";
import { Parser } from "./src/Parser";

const report = (tree: Object) => console.log(JSON.stringify(tree, undefined, 3));

while (true) {
  const input = prompt({ sigint: true })("> ");
  const parser = new Parser(input);
  const tree = parser.parseCell();
  console.log();
  report(tree);
  console.log();
}
