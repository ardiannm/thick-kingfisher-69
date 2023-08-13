import Read from "./dev/helper/read.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  interpreter.run();
}

export { Lexer, Parser, Interpreter };
