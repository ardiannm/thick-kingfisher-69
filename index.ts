import prompt from "prompt-sync";
import Interpreter from "./src/Interpreter";
import ReadFile from "./src/dev/ReadFile";
import Lexer from "./src/Lexer";
import Parser from "./src/Parser";

while (true) {
  const input = prompt({ sigint: true })(">> ") || ReadFile();
  new Parser(input).parse();
}
