import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { StatementSyntax } from "./statement.syntax";
import { SyntaxToken } from "./syntax.token";
import { CompositeTokenKind } from "./kind/composite.token.kind";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class CellAssignment extends StatementSyntax {
  constructor(public override tree: SyntaxTree, public left: ExpressionSyntax, public Keyword: SyntaxToken<CompositeTokenKind.GreaterGreaterToken>, public expression: ExpressionSyntax) {
    super(tree, SyntaxNodeKind.CellAssignment);
  }
}
