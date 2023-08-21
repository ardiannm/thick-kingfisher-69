import Lexer from "./src/lexer";
import prompt from "prompt-sync"

while (true) {
  console.log();
  const input = prompt(">>");
  // const interpreter = new Interpreter(input);
  // interpreter.run();
  const lex = new Lexer(input);
  console.log(lex);
}
