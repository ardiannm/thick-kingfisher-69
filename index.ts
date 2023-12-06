import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

import Promp from "readline-sync";

const report = (Obj: Object = "") => console.log(Obj);

while (true) {
  const Input = Promp.question("> ") || "A1->1; A2->3; A1+A2;";

  const Tree = SyntaxTree.Parse(Input);

  report();

  console.log(JSON.stringify(Tree, undefined, 2));

  report();
}
