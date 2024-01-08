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

  tree.Parse().Print().Bind().program;

  if (tree.diagnostics.Any()) {
    console.log();
    for (const d of tree.diagnostics.Bag) console.log(d);
  }

  console.log();
}
