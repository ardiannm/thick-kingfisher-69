import { SyntaxTree } from "./src/CodeAnalysis/Parsing/SyntaxTree";
import { createInterface } from "readline";
import { ColorPalette } from "./src/View/ColorPalette";

const Prompt = createInterface({ input: process.stdin, output: process.stdout });
const Program = SyntaxTree.Init({ AutoDeclaration: true, CompactCellNames: true });

console.clear();

const Inputs = new Array<string>();

const Fn = () => {
  Prompt.question("", function (Input) {
    if (Input === "q") {
      Prompt.close();
    } else if (Input === "a") {
      console.clear();
      Fn();
    } else if (Input !== "") {
      Inputs.push(Input);
      Fn();
    } else {
      Input = Inputs.join("\n");
      Inputs.length = 0;
      Program.Parse(Input).Bind().Log().Evaluate();
      if (Program.Diagnostics.Any()) {
        for (const d of Program.Diagnostics.Get()) console.log(d);
        Program.Diagnostics.Clear();
      } else {
        console.log();
        console.log(ColorPalette.Teal(Program.Value.toString()));
        console.log();
      }
      Fn();
    }
  });
};

Fn();
