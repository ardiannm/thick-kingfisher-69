import { SyntaxTree } from "./src/CodeAnalysis/Parser/SyntaxTree";

import readline from "readline";

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
      console.log();
      source.Parse(text).Lower().Print().Bind();
      if (source.diagnostics.Any()) {
        console.log();
        for (const d of source.diagnostics.Bag) console.log(d);
        source.diagnostics.Clear();
      }
      console.log();
      Fn();
    }
  });
};

Fn();
