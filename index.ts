import Prompt from "readline-sync";

import { Interpreter } from "./src/Interpreter";
import { RgbColor } from "./src/Text/RgbColor";
import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

const interpreter = new Interpreter();

console.clear();

while (true) {
  const input = Prompt.question("> ");
  console.log();

  if (input === "q") {
    break;
  }

  const v = interpreter.Bind(input);

  if (v.Diagnostics.Any()) {
    for (const d of v.Diagnostics.Bag) {
      console.log(RgbColor.Teal(d.Message));
    }
    v.Diagnostics.ClearDiagnostics();
  } else {
    const Ouput = SyntaxTree.Print(v);
    console.log(Ouput);
  }

  // const v = interpreter.Evaluate(input);

  // if (v.Diagnostics.Any()) {
  //   for (const d of v.Diagnostics.Bag) {
  //     console.log(RgbColor.Teal(d.Message));
  //   }
  //   v.Diagnostics.ClearDiagnostics();
  // } else {
  //   const Ouput = RgbColor.Teal(v.Value.toString());
  //   console.log(Ouput);
  // }

  console.log();
}
