import { Tokenizer } from "../token-based-parser/tokenizer.ts";

while (true) {
  const input = prompt("//") || "";
  const tokens = new Tokenizer(input);

  console.log(tokens.getNextToken());
  console.log(tokens.getNextToken());

}
