import { SourceText } from "../../lexing/source.text";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxUnaryOperatorKind } from "./kind/syntax.unary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxUnaryExpression extends SyntaxNode {
  constructor(public override sourceText: SourceText, public operator: SyntaxToken<SyntaxUnaryOperatorKind>, public right: SyntaxNode) {
    super(sourceText, SyntaxNodeKind.SyntaxUnaryExpression);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.operator;
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right.getLastChild();
  }
}
