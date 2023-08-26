import prompt from "prompt-sync";
import ReadFile from "./src/dev/ReadFile";
import Parser from "./src/Parser";

while (true) {
  const input = prompt({ sigint: true })(">> ") || ReadFile();
  const tree = new Parser(input).parse();
  console.log(JSON.stringify(tree, undefined, 2));
}
