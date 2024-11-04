import { SyntaxTree } from "./src/syntax.tree";

const node = SyntaxTree.createFrom("A3 :: !A1+A2");

node.text.diagnostics.getDiagnostics().forEach((d) => console.log(d.message));
