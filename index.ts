import prompt from "prompt-sync";

import { Parser } from "./src/Parser";

const report = (tree: Object = "") => console.log(`${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}`);

while (true) {
  const Input = prompt({ sigint: true })("> ");

  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();

  if (Syntax.Diagnostics.length > 0) {
    report();
    for (const Message of Syntax.Diagnostics) report(Message);
    report();
    continue;
  }

  report();
  console.log(Tree.Print());
  report();
}
