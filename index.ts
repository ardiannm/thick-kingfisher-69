import { SyntaxTree } from "./src/syntax.tree";

var text = `A1 :: A2 + A3
`;

const tree = SyntaxTree.createFrom(text);

console.log();
console.log(tree.source.diagnostics.getDiagnostics().map((d) => d.message));
console.log();
