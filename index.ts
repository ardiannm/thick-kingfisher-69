import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";
import { Diagnostic, Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";

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
    Diagnostics_.Report();
    continue;
  }

  if (ShowTree) Diagnostics_.Report(Tree);

  if (Diagnostics_.Any()) {
    Diagnostics_.Show();
  } else {
    try {
      Diagnostics_.Report(Evaluator_.Evaluate(Tree));
    } catch (error) {
      Diagnostics_.Report((error as Diagnostic).Message);
    }
  }
  Diagnostics_.Clear();
}
