// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Interpreter from "../interpreter.ts";
import Read from "./read.ts";
import Write from "./write.ts";

while (true) {
  console.log();
  const input = prompt(">>") || (await Read("./dev/template.html")) || "";
  const interpreter = new Interpreter(input);

  interpreter.run();

  Write(interpreter);
}
