import readline from "readline";

import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });

const source = SyntaxTree.Init();

console.clear();

const src = new Array<string>();

const Fn = () => {
  // there is an error with this test case:
  // A1 -> A1
  // A2 -> A1
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
      source.Parse(text).Log().Bind().Evaluate();
      if (source.diagnostics.Any()) {
        console.log();
        for (const d of source.diagnostics.Bag) console.log(d);
        source.diagnostics.Clear();
      } else {
        console.log();
        console.log(source.value.toString());
      }
      console.log();
      Fn();
    }
  });
};

Fn();
