import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export class SyntaxRoot extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Expressions: Array<Expression>) {
    super(Kind);
  }
}
