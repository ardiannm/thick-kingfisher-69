import { SyntaxTree } from "."
import { Evaluator } from "."

export { SyntaxToken } from "./src/phases/lexing/syntax.token"
export { SyntaxKind } from "./src/phases/parsing/syntax.kind"
export { SyntaxNode } from "./src/phases/parsing/syntax.node"
export { Diagnostic } from "./src/diagnostics/diagnostic"
export { SourceText } from "./src/phases/lexing/source.text"
export { SyntaxTree } from "./src/syntax.tree"
export { BoundScope } from "./src/phases/binding/bound.scope"
export { SyntaxBinaryExpression } from "./src/phases/parsing/syntax.binary.expression"
export { SyntaxCompilationUnit } from "./src/phases/parsing/syntax.compilation.unit"
export { SyntaxUnaryExpression } from "./src/phases/parsing/syntax.unary.expression"
export { Evaluator } from "./src/phases/evaluating/evaluator"

let text = `A1 :: 4
A2 :: A1
A3 :: A1 + A2
A4 :: A1+A2+A3+A2

`

Evaluator.evaluate(SyntaxTree.createFrom(text))
