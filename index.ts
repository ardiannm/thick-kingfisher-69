import { SyntaxTree } from "./src/syntax.tree";

var text = `
A1 :: A4
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A1
`;

const tree = SyntaxTree.createFrom(text);

console.log();
console.log(tree.source.diagnostics.getDiagnostics().map((d) => d.message));
console.log();
