import { SyntaxTree } from "../../syntax.tree";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxToken } from "./syntax.token";

export class SyntaxCellReference extends SyntaxExpression {
  constructor(public override tree: SyntaxTree, public left: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public right: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    super(tree, SyntaxNodeKind.SyntaxCellReference);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.left.getFirstChild();
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right.getLastChild();
  }
}
