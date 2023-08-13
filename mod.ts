import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  const interpreter = new Interpreter(input);
  interpreter.run();
}

export { Lexer, Parser, Interpreter };
