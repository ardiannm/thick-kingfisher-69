import { SyntaxTree } from ".";
import { Evaluator } from ".";

export { SyntaxKind } from "./src/phase/parsing/syntax.kind";
export { SyntaxNode } from "./src/phase/parsing/syntax.node";
export { Diagnostic } from "./src/diagnostics/diagnostic";
export { SourceText } from "./src/phase/lexing/source.text";
export { SyntaxTree } from "./src/syntax.tree";
export { BoundScope } from "./src/phase/binding/bound.scope";
export { SyntaxBinaryExpression } from "./src/phase/parsing/syntax.binary.expression";
export { SyntaxCompilationUnit } from "./src/phase/parsing/syntax.compilation.unit";
export { SyntaxUnaryExpression } from "./src/phase/parsing/syntax.unary.expression";
export { Evaluator } from "./src/evaluator";

let text = `A1 :: 4
A2 :: A1
A3 :: A1 + A2
A4 :: A1+A2+A3+A2

`;

Evaluator.evaluate(SyntaxTree.createFrom(text));
