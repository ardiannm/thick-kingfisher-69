import Read from "./dev/logger/helper/read.ts";
import Write from "./dev/logger/helper/write.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  const run = interpreter.run();

  Write(run, "./dev/logger/parser.json");
  const response = Write(run, "./dev/logger/interpreter.json");

  console.log(`\n\tfrom <${request.length.toLocaleString()}> to <${response.length.toLocaleString()}> characters\n`);
}

export { Lexer, Parser, Interpreter };
