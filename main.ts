import { Highlighter } from "./highlighter.ts";
import { Parser } from "./parser.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);

  tree.generate();

  const parser = new Parser(input);
  const tokens = parser.parseAddition();
  console.log(tokens.prettyPrint());
}
