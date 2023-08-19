import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";
import Read from "./dev/helper/read.ts";

while (true) {
  console.log();
  const input = prompt(">>") || await Read();
  const interpreter = new Interpreter(input);
  interpreter.run();
}

export { Lexer, Parser, Interpreter };
