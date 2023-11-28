import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";
import { Diagnostic, Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";

const report = (tree: Object = "") => console.log("\n" + `${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}` + "\n");

const Diagnostics_ = new Diagnostics();
const Environment_ = new Environment(Diagnostics_);
const Evaluator_ = new Evaluator(Environment_, Diagnostics_);

var ShowTree = false;

while (true) {
  const Input = Prompt("> ");
  const Syntax = new Parser(Input, Diagnostics_);
  const Tree = Syntax.Parse();

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    report();
    continue;
  }

  if (ShowTree) report(Tree);

  if (Diagnostics_.Any()) {
    Diagnostics_.Show();
  } else {
    try {
      report(Evaluator_.Evaluate(Tree));
    } catch (error) {
      report((error as Diagnostic).Message);
    }
  }
  Diagnostics_.Clear();
}
