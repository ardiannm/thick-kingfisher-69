import { Parser } from "./parser.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Parser(input).parseAddition();

  console.log(tree);

  console.log("\n\n");
}
