import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { Expression } from "./Expression";

export class RangeReference extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
