// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Parser from "../parser.ts";
import Stringify from "../stringify.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  console.log(Stringify(new Parser(input).parse()));
}
