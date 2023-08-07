// import { Parser, Interpreter } from "https://deno.land/x/amparser@v0.04/mod.ts";

import Read from "./logger/helper/read.ts";
import Write from "./logger/helper/write.ts";

import Interpreter from "../interpreter.ts";

while (true) {
  const input = prompt(">>") || (await Read("./dev/template.html")) || "";
  const interpreter = new Interpreter(input);
  const value = interpreter.run();

  Write(interpreter.tree, "./dev/logger/parser.json");
  Write(value, "./dev/logger/interpreter.json");
}
