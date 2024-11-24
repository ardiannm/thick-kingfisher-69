import { SourceText } from "../../lexing/source.text";
import { SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxUnaryExpression extends SyntaxNode {
  constructor(public override source: SourceText, public operator: SyntaxToken<SyntaxUnaryOperatorKind>, public right: SyntaxNode) {
    super(source, SyntaxKind.SyntaxUnaryExpression);
  }

  override getFirstChild(): SyntaxToken {
    return this.operator;
  }

  override getLastChild(): SyntaxToken {
    return this.right.getLastChild();
  }
}
