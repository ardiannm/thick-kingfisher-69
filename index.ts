import Prompt from "readline-sync";

import { Interpreter } from "./src/Interpreter";
import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

const interpreter = new Interpreter();

console.clear();

while (true) {
  const input = Prompt.question("> ");

  if (input === "q") {
    break;
  }

  if (input === "a") {
    console.clear();
    continue;
  }

  const b = interpreter.Parse(input);

  console.log(SyntaxTree.Print(b));

  console.log();
}
