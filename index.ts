import Prompt from "readline-sync";

import { Interpreter } from "./src/Interpreter";
import { RgbColor } from "./src/Text/RgbColor";

const interpreter = new Interpreter();

while (true) {
  const input = Prompt.question("> ");
  if (input === "q") {
    break;
  }
  const v = interpreter.Evaluate(input);

  if (v.Diagnostics.Any()) {
    for (const d of v.Diagnostics.Bag) {
      console.log(RgbColor.Terracotta(d.Message));
    }
  } else {
    const Ouput = RgbColor.Terracotta(v.Value.toString());
    console.log(Ouput);
  }
}
