import Read from "./dev/logger/helper/read.ts";
import Write from "./dev/logger/helper/write.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  const tree = interpreter.run();

  Write(tree, "./dev/logger/parser.json");
  Write(tree, "./dev/logger/interpreter.json");

  console.log(tree);
}

export { Lexer, Parser, Interpreter };
