import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

import Promp from "readline-sync";

const report = (Obj: Object = "") => console.log(Obj);

while (true) {
  const Input = Promp.question("> ") || "A1->1; A2->3; A1+A2;";

  report();

  const Tree = SyntaxTree.Parse(Input);
  const Value = SyntaxTree.Evaluate(Input);

  for (const Branch of Tree.GetBranch()) console.log(Branch);

  // Report The Tree Structure
  report(JSON.stringify(Tree, undefined, 2));

  report();

  // Report The Evalutor Returned Value
  report(Value.toString());

  report();
}
