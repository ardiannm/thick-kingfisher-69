import { SyntaxTree } from "./src/syntax.tree";

const node = SyntaxTree.createFrom("A3 :: !A 1+A2");

node.sourceText.diagnostics.getDiagnostics().forEach((d) => console.log(d.message));
