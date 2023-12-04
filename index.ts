import { question as Prompt } from "readline-sync";
import { SyntaxTree } from "./src/CodeAnalysis/SyntaxTree";

while (true) {
  const Input = Prompt("> ");
  const Tree = SyntaxTree.Parse(Input);
  console.log(Tree);
}
