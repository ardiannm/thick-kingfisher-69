import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

import Promp from "readline-sync";

const report = (Obj: Object = "") => console.log(Obj);

while (true) {
  const Input = Promp.question("> ") || "A1->1; A2->A1; A3->A1+A2; A1->3; A2->4; A3->A1; A1->7;";

  const Tree = SyntaxTree.Evaluate(Input);

  report();

  console.log(JSON.stringify(Tree, undefined, 2));

  report();
}
