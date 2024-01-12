import Prompt from "readline-sync";

import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

console.clear();

const source = SyntaxTree.Init();

const src = new Array<string>();

while (true) {
  var text = Prompt.question();

  if (text === "q") {
    break;
  }

  if (text === "a") {
    console.clear();
    continue;
  }

  if (text !== "") {
    src.push(text);
    continue;
  }

  text = src.join("\n");
  src.length = 0;

  console.log();

  source.Parse(text).Lower().Print().Bind();

  if (source.diagnostics.Any()) {
    console.log();
    for (const d of source.diagnostics.Bag) console.log(d);
    source.diagnostics.Clear();
  }

  console.log();
}
