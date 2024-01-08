import Prompt from "readline-sync";

import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

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

  const tree = SyntaxTree.Compile(input);
  console.log(SyntaxTree.Print(tree.Parse()));

  console.log();
}
