// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import { Interpreter } from "../interpreter.ts";
import { Parser } from "../mod.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  const token = new Parser(input).parse();
  console.log(token);

  const interpreter = new Interpreter();
  const value = interpreter.evaluate(token);
  console.log(value);
}
