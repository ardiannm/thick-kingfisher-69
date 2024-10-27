import { SyntaxTree } from "../../syntax.tree";
import { SyntaxCompositeTokenKind } from "./kind/syntax.composite.token.kind";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxToken } from "./syntax.token";
import { SyntaxStatement } from "./sytax.statements";

export class SyntaxCellAssignment extends SyntaxStatement {
  constructor(public override tree: SyntaxTree, public left: SyntaxExpression, public operator: SyntaxToken<SyntaxCompositeTokenKind.ColonColonToken>, public expression: SyntaxExpression) {
    super(tree, SyntaxNodeKind.SyntaxCellAssignment);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.left.getFirstChild();
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.expression.getLastChild();
  }
}
