import { Highlighter } from "./highlighter.ts";
import { Parser } from "./parser.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);

  tree.generate();

  console.log(new Parser(input).parseAddition());
}
