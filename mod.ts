import Read from "./dev/helper/read.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";
import Write from "./dev/helper/write.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  const value = interpreter.run();

  console.log();
  console.log(value.log);

  Write(value, "./dev/logger.json");
}

export { Lexer, Parser, Interpreter };
