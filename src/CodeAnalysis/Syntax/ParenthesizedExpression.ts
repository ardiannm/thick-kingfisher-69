import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { Expression } from "./Expression";

export class ParenthesizedExpression extends Expression {
  constructor(public Kind: SyntaxKind, public OpenParen: SyntaxNode, public Expression: SyntaxNode, public CloseParen: SyntaxNode) {
    super(Kind);
  }
}
