import prompt from "prompt-sync";
import ReadFile from "./dev/ReadFile";
import Parser from "./src/Parser";

while (true) {
  const input = prompt({ sigint: true })(">> ") || ReadFile();
  new Parser(input).parse();
}
