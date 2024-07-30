import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxCellReference extends SyntaxExpression {
  constructor(protected override tree: SyntaxTree, public left: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public right: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    super(tree, SyntaxNodeKind.SyntaxCellReference);
  }
}
