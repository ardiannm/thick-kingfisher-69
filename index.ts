import prompt from "prompt-sync";
import Interpreter from "./src/interpreter";

while (true) {
  console.log();
  const input = prompt({ sigint: true })(">> ");
  const interpreter = new Interpreter(input);
  interpreter.run();
}
