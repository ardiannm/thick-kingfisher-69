import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";

export class CopyCell extends Expression {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Right: Expression) {
    super(Kind);
  }
}
