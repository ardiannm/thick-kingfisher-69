// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Parser from "../parser.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  const parser = new Parser(input);
  const tree = parser.parse();
  console.log(tree);
  if (parser.errors.length) {
    console.log();
    console.log(parser.errors.map((e) => e.message));
  }
}
