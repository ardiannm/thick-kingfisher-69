import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

import Promp from "readline-sync";

const report = (Obj: Object = "") => console.log(Obj);

while (true) {
  const Input = Promp.question("> ") || "A1->1; A2->3; A1+A2;";

  const Tree = SyntaxTree.Parse(Input);
  const BoundTree = SyntaxTree.Bind(Input);

  report();

  report(JSON.stringify(BoundTree, undefined, 2));

  report();

  console.log(Tree.ObjectId);

  report();
}
