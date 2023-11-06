import prompt from "prompt-sync";

import { Lexer } from "./src/Lexer";

while (true) {
  const input = prompt({ sigint: true })("> ");
  const source = new Lexer(input);

  while (source.hasMoreTokens()) {
    const token = source.getNextToken();
    console.log(token);
  }
}
