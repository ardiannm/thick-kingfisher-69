// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import { Interpreter } from "../interpreter.ts";
import { stringify } from "../stringify.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";

  const interpreter = new Interpreter(input);
  const value = interpreter.run();
  console.log(stringify(value));
}
