import { Highlighter } from "../highlighter.ts";
import { Parser } from "../parser.ts";

while (true) {
  const input = prompt("//") || "";
  const parser = new Parser(input);
  const tree = parser.parseAddition();
  console.log(tree);
  const highlighter = new Highlighter();
  console.log(highlighter.generate(tree));
}
