import { SourceText } from "../../lexing/source.text";
import { SyntaxBinaryOperatorKind, SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxBinaryExpression extends SyntaxNode {
  constructor(public override source: SourceText, public left: SyntaxNode, public operator: SyntaxToken<SyntaxBinaryOperatorKind>, public right: SyntaxNode) {
    super(source, SyntaxKind.SyntaxBinaryExpression);
  }

  override getFirstChild(): SyntaxToken {
    return this.left.getFirstChild();
  }
  override getLastChild(): SyntaxToken {
    return this.right.getLastChild();
  }
}
