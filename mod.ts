import Read from "./dev/logger/helper/read.ts";
import Write from "./dev/logger/helper/write.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  const runtime = interpreter.run();

  Write(interpreter.tree, "./dev/logger/parser.json");
  Write(runtime, "./dev/logger/interpreter.json");

  console.log(runtime);
}

export { Lexer, Parser, Interpreter };
