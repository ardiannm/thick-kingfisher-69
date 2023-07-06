import { Parser } from "../parser.ts";

while (true) {
  const input = prompt("//") || "";
  const parser = new Parser(input)
  const tree = parser.parse()
  console.log(tree);
}
