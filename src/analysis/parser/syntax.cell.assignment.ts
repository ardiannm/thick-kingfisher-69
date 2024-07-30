import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxStatement } from "./sytax.statements";
import { SyntaxToken } from "./syntax.token";
import { SyntaxCompositeTokenKind } from "./kind/syntax.composite.token.kind";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxCellAssignment extends SyntaxStatement {
  constructor(protected override tree: SyntaxTree, public left: SyntaxExpression, public keyword: SyntaxToken<SyntaxCompositeTokenKind.ColonColonToken>, public expression: SyntaxExpression) {
    super(tree, SyntaxNodeKind.SyntaxCellAssignment);
  }
}
