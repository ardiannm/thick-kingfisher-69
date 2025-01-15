import { SyntaxKind } from "./syntax.kind"
import { SyntaxNode } from "./syntax.node"
import { SyntaxToken } from "../lexing/syntax.token"

export class SyntaxCellReference extends SyntaxNode {
  constructor(public left: SyntaxToken<SyntaxKind.IdentifierToken>, public right: SyntaxToken<SyntaxKind.NumberToken>) {
    super(left.source, SyntaxKind.SyntaxCellReference)
  }

  override getFirstChild(): SyntaxToken {
    return this.left.getFirstChild()
  }

  override getLastChild(): SyntaxToken {
    return this.right.getLastChild()
  }

  get name() {
    return this.left.span.text + this.right.span.text
  }
}
