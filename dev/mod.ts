// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import { Lexer } from "../lexer.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  console.log(new Lexer(input).getNextToken());
}
