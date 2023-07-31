// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Parser from "../parser.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  console.log(new Parser(input).parse());
}
