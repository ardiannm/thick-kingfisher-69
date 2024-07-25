import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class CellReference extends ExpressionSyntax {
  constructor(public override tree: SyntaxTree, public left: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public right: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    super(tree, SyntaxNodeKind.CellReference);
  }
}
