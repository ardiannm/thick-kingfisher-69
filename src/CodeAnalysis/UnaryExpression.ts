import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { Expression } from "./Expression";

export class UnaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
