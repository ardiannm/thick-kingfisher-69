import { SyntaxTree } from "./src/CodeAnalysis/Parsing/SyntaxTree";
import { CompilerOptions } from "./src/CompilerOptions";
import { createInterface } from "readline";
import { Logger } from "./src/Logger";

const Prompt = createInterface({ input: process.stdin, output: process.stdout });
const Program = SyntaxTree.Init(new CompilerOptions(true, false));

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
      Program.Parse(Input).Bind().Evaluate();
      if (Program.Diagnostics.Any()) {
        for (const d of Program.Diagnostics.Get()) console.log(d);
        Program.Diagnostics.Clear();
      } else {
        console.log(Program.Value.toString());
        console.log();
      }
      Fn();
    }
  });
};

Fn();
