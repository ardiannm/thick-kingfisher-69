import { SyntaxTree } from "./src/syntax.tree";

var text = `A1 :: A3
  A2 :: A1
   A3 :: A2
A4 :: A3
  A1 :: A4
`;

console.log();
// const tree =
SyntaxTree.createFrom(text);

// console.log(tree.source.diagnostics.getDiagnostics().map((d) => d.message));
console.log();
