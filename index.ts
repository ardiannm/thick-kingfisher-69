import { Parser } from "./src/Parser";

import prompt from "prompt-sync";

const report = (tree: Object = "") => console.log(`${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}`);

while (true) {
  const Input = prompt({ sigint: true })("> ");
  const Syntax = new Parser(Input);
  const Tree = Syntax.Parse();
  report();
  report(Tree.Print());
  if (Syntax.Diagnostics.length > 0) {
    report();
    for (const Message of Syntax.Diagnostics) report(Message);
    report();
  }
}
