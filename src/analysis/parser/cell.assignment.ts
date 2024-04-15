import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { StatementSyntax } from "./statement.syntax";
import { SyntaxToken } from "./syntax.token";
import { CompositeTokenKind } from "./kind/composite.token.kind";

export class CellAssignment extends StatementSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.CellAssignment,
    public Left: ExpressionSyntax,
    public Keyword: SyntaxToken<CompositeTokenKind.GreaterGreaterToken>,
    public Expression: ExpressionSyntax
  ) {
    super(Kind);
  }
}
