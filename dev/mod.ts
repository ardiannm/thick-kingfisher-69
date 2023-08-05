// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Interpreter from "../interpreter.ts";
import { write } from "./write.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  const interpreter = new Interpreter(input);
  interpreter.run();

  write(interpreter.logger);
}
