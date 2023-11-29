import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Evaluator } from "./src/Evaluator";
import { Environment } from "./src/Environment";
import { Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";
import { Diagnostic } from "./src/CodeAnalysis/Diagnostics/Diagnostic";

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
    Diagnostics_.Log();
    continue;
  }

  if (ShowTree) Diagnostics_.Log(Tree);

  if (Diagnostics_.Any()) {
    Diagnostics_.Show();
  } else {
    try {
      Diagnostics_.Log(Evaluator_.Evaluate(Tree));
    } catch (error) {
      Diagnostics_.Log((error as Diagnostic).Message);
    }
  }
  Diagnostics_.Clear();
}
