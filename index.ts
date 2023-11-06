import prompt from "prompt-sync";

import { Lexer } from "./src/Lexer";

var space = false;
const source = new Lexer("");

while (true) {
  const input = prompt({ sigint: true })("> ");

  source.input = input;

  if (input === "space") {
    space = !space;
    space ? source.considerSpace() : source.ignoreSpace();
    console.log("\n\tspaces will be " + (space ? "considered" : "ignored") + "\n");
    continue;
  }

  console.log();

  while (source.hasMoreTokens()) {
    const token = source.getNextToken();
    console.log(token);
  }

  console.log();
}
