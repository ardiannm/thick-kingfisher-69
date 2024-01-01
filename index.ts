import { Binder } from "./src/CodeAnalysis/Binder/Binder";
import { Parser } from "./src/CodeAnalysis/Parser/Parser";
import { SourceText } from "./src/Text/SourceText";
import { BoundProgram } from "./src/CodeAnalysis/Binder/BoundProgram";
import { Program } from "./src/CodeAnalysis/Parser/Program";
import { Evaluator } from "./src/Evaluator";
import { RgbColor } from "./src/Text/RgbColor";

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
    tree.Diagnostics.Bag.map((d) => console.log(RgbColor.Teal(d.Message)));
    console.log();
    continue;
  }

  const bound = binder.Bind(tree) as BoundProgram;

  if (bound.Diagnostics.Any()) {
    bound.Diagnostics.Bag.map((d) => console.log(RgbColor.Teal(d.Message)));
    console.log();
    continue;
  }

  const result = evaluator.EvaluateNode(bound);

  if (result.Diagnostics.Any()) {
    result.Diagnostics.Bag.map((d) => console.log(RgbColor.Teal(d.Message)));
    console.log();
    continue;
  }

  console.log(result.Value.toString());
  console.log();
}
