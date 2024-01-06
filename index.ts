import Prompt from "readline-sync";

import { Interpreter } from "./src/Interpreter";
import { RgbColor } from "./src/Text/RgbColor";
import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

const interpreter = new Interpreter();

console.clear();

while (true) {
  const input = Prompt.question("> ");

  if (input === "q") {
    break;
  }

  if (input === "a") {
    console.clear();
    continue;
  }

  // const b = interpreter.Bind(input);

  // if (b.Diagnostics.Any()) {
  //   for (const d of b.Diagnostics.Bag) {
  //     console.log(RgbColor.Azure(d.Message));
  //   }
  // } else {
  //   console.log(SyntaxTree.Print(b));
  // }

  const v = interpreter.Evaluate(input);

  if (v.Diagnostics.Any()) {
    for (const d of v.Diagnostics.Bag) {
      console.log(RgbColor.Azure(d.Message));
    }
  } else {
    console.log(RgbColor.Azure(v.Value.toString()));
  }

  // b.Diagnostics.ClearDiagnostics();
  v.Diagnostics.ClearDiagnostics();

  console.log();
}
