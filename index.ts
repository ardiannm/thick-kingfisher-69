import { Binder } from "./src/CodeAnalysis/Binder/Binder";
import { Parser } from "./src/CodeAnalysis/Parser/Parser";
import { SourceText } from "./src/Text/SourceText";
import { BoundProgram } from "./src/CodeAnalysis/Binder/BoundProgram";
import { Program } from "./src/CodeAnalysis/Parser/Program";
import { Evaluator } from "./src/Evaluator";

import Prompt from "readline-sync";

const binder = new Binder();
const evaluator = new Evaluator();

while (true) {
  const input = Prompt.question("> ");
  console.clear();

  if (input === "q") break;

  const textinput = SourceText.From(input);
  const parser = new Parser(textinput);
  const tree = parser.Parse() as Program;

  if (tree.Diagnostics.Any()) {
    const arr = tree.Diagnostics.Bag.map((d) => d.Message);
    console.log(arr);
    continue;
  }

  const bound = binder.Bind(tree) as BoundProgram;

  if (bound.Diagnostics.Any()) {
    const arr = bound.Diagnostics.Bag.map((d) => d.Message);
    console.log(arr);
    continue;
  }

  const result = evaluator.EvalauteProgram(bound);

  if (result.Diagnostics.Any()) {
    const arr = result.Diagnostics.Bag.map((d) => d.Message);
    console.log(arr);
    continue;
  }

  console.log(result);
}
