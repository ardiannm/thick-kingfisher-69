import prompt from "prompt-sync";
import Interpreter from "./src/Interpreter";
import ReadFile from "./src/dev/ReadFile";

while (true) {
  const input = prompt({ sigint: true })(">> ") || ReadFile();
  console.log();
  const interpreter = new Interpreter(input);
  interpreter.run();
  console.log();
}
