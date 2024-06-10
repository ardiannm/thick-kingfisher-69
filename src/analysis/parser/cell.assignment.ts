import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { StatementSyntax } from "./statement.syntax";
import { SyntaxToken } from "./syntax.token";
import { CompositeTokenKind } from "./kind/composite.token.kind";

export class CellAssignment extends StatementSyntax {
  constructor(
    public override kind: SyntaxNodeKind.CellAssignment,
    public left: ExpressionSyntax,
    public Keyword: SyntaxToken<CompositeTokenKind.GreaterGreaterToken>,
    public expression: ExpressionSyntax
  ) {
    super(kind);
  }
}
