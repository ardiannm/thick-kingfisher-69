import Prompt from "readline-sync";

import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

console.clear();

const source = SyntaxTree.Init();

while (true) {
  const text = Prompt.question("> ");

  if (text === "q") {
    break;
  }

  if (text === "a") {
    console.clear();
    continue;
  }

  console.log();
  source.Parse(text).Print().Bind().tree;

  if (source.diagnostics.Any()) {
    console.log();
    for (const d of source.diagnostics.Bag) console.log(d);
    source.diagnostics.Clear();
  }

  console.log();
}
