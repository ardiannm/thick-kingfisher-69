import Promp from "readline-sync";

import { Binder } from "./src/Binder";
import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";
import { Environment } from "./src/Environment";
import { Evaluator } from "./src/Evaluator";
import { Diagnostic } from "./src/CodeAnalysis/Diagnostics/Diagnostic";

const report = (Obj: Object = "") => console.log(Obj);

const EnvFactory = new Environment();

while (true) {
  const Input = Promp.question("> ") || "A1->1; A2->A1+5; A3->A1+A2; A1->4; A3->2*A1+A2;";
  try {
    const value = new Evaluator(EnvFactory).Evaluate(new Binder(EnvFactory).Bind(SyntaxTree.Parse(Input)));
    report(JSON.stringify(value, undefined, 2));
  } catch (error) {
    report((error as Diagnostic).Message);
  }
  report();
}
