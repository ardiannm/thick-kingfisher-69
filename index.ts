export { SyntaxKind } from "./src/phase/parsing/syntax.kind";
export { SyntaxNode } from "./src/phase/parsing/syntax.node";
export { Diagnostic } from "./src/diagnostics/diagnostic";
export { SourceText } from "./src/phase/lexing/source.text";
export { SyntaxTree } from "./src/syntax.tree";
export { BoundScope } from "./src/phase/binding/bound.scope";
export { SyntaxBinaryExpression } from "./src/phase/parsing/syntax.binary.expression";
export { SyntaxCompilationUnit } from "./src/phase/parsing/syntax.compilation.unit";
export { SyntaxUnaryExpression } from "./src/phase/parsing/syntax.unary.expression";

let text = `        A1
"moving cell one to the right causes it to break into its tokens"
"Token.hasTrivia isn't working properly"
`;

import { SyntaxTree } from ".";

const tree = SyntaxTree.createFrom(text);

for (const d of tree.source.diagnosticsBag.diagnostics) console.log(d.message);
