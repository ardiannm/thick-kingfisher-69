import Prompt from "readline-sync";

import { Binder } from "./src/CodeAnalysis/Binder/Binder";
import { Parser } from "./src/CodeAnalysis/Parser/Parser";
import { SourceText } from "./src/Text/SourceText";
import { BoundProgram } from "./src/CodeAnalysis/Binder/BoundProgram";
import { Program } from "./src/CodeAnalysis/Parser/Program";

const binder = new Binder();

while (true) {
  const input = Prompt.question("> ");

  if (input === "q") break;

  const textinput = SourceText.From(input);
  const parser = new Parser(textinput);
  const tree = parser.Parse() as Program;

  if (tree.Diagnostics.Any()) {
    console.log(tree.Diagnostics);
    continue;
  }

  const bound = binder.Bind(tree) as BoundProgram;

  if (bound.Diagnostics.Any()) {
    bound.Diagnostics.Bag.map((d) => console.log(d.Message));
    continue;
  }

  // console.log(bound);
}
