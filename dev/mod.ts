// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Parser from "../parser.ts";
import { stringify } from "../stringify.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  console.log(stringify(new Parser(input).parse()));
}
