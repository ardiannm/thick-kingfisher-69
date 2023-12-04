import { question as Prompt } from "readline-sync";
import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

var ShowTree = false;

while (true) {
  const Input = Prompt("> ");

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    continue;
  }

  for (const Token of SyntaxTree.ParseTokens(Input)) console.log(Token);
  console.log();
  console.log(SyntaxTree.Parse(Input));
}
