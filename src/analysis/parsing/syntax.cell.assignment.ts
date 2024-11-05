import { SyntaxCompositeTokenKind } from "./kind/syntax.composite.token.kind";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxCellAssignment extends SyntaxNode {
  constructor(public left: SyntaxNode, public operator: SyntaxToken<SyntaxCompositeTokenKind.ColonColonToken>, public expression: SyntaxNode) {
    super(SyntaxNodeKind.SyntaxCellAssignment);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.left.getFirstChild();
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.expression.getLastChild();
  }
}
