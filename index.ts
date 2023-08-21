import prompt from "prompt-sync";
import Interpreter from "./src/interpreter";

while (true) {
  const input = prompt({ sigint: true })(">> ");
  console.log();
  const interpreter = new Interpreter(input);
  interpreter.run();
  console.log();
}
