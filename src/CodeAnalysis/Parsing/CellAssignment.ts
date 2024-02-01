import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { StatementSyntax } from "./StatementSyntax";
import { SyntaxToken } from "./SyntaxToken";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";

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
