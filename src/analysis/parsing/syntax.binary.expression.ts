import { SourceText } from "../../lexing/source.text";
import { SyntaxBinaryOperatorKind } from "./kind/syntax.binary.operator.kind";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxBinaryExpression extends SyntaxNode {
  constructor(public override sourceText: SourceText, public left: SyntaxNode, public operator: SyntaxToken<SyntaxBinaryOperatorKind>, public right: SyntaxNode) {
    super(sourceText, SyntaxNodeKind.BinaryExpression);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.left.getFirstChild();
  }
  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right.getLastChild();
  }
}
