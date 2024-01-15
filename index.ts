import readline from "readline";

import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";
import { RgbColor } from "./src/Text/RgbColor";

const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });

console.clear();

const source = SyntaxTree.Init();
const src = new Array<string>();

const Fn = () => {
  prompt.question("", function (text) {
    if (text === "q") {
      prompt.close();
    } else if (text === "a") {
      console.clear();
      Fn();
    } else if (text !== "") {
      src.push(text);
      Fn();
    } else {
      text = src.join("\n");
      src.length = 0;
      source.Parse(text).Print().Bind().Evaluate();
      if (source.diagnostics.Any()) {
        console.log();
        for (const d of source.diagnostics.Bag) console.log(d);
        source.diagnostics.Clear();
      } else {
        console.log();
        source.TextSpan();
        console.log(RgbColor.Azure(source.value.toString()));
      }
      console.log();
      Fn();
    }
  });
};

Fn();
