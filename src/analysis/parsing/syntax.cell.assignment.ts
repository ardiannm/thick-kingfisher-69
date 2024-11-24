import { SourceText } from "../../lexing/source.text";
import { SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxCellAssignment extends SyntaxNode {
  constructor(public override source: SourceText, public left: SyntaxNode, public operator: SyntaxToken, public expression: SyntaxNode) {
    super(source, SyntaxKind.SyntaxCellAssignment);
  }

  override getFirstChild(): SyntaxToken {
    return this.left.getFirstChild();
  }

  override getLastChild(): SyntaxToken {
    return this.expression.getLastChild();
  }
}
