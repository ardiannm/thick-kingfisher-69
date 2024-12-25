import { SyntaxCellReference } from "./syntax.cell.reference";
import { SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "../lexing/syntax.token";

export class SyntaxCellAssignment<Left extends SyntaxNode = SyntaxCellReference, Right extends SyntaxNode = SyntaxNode> extends SyntaxNode {
  constructor(public left: Left, public operator: SyntaxToken, public expression: Right) {
    super(left.source, SyntaxKind.SyntaxCellAssignment);
  }

  override getFirstChild(): SyntaxToken {
    return this.left.getFirstChild();
  }

  override getLastChild(): SyntaxToken {
    return this.expression.getLastChild();
  }
}
