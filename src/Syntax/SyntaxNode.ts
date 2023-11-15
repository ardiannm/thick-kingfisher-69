import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}
}

abstract class ExpressionSyntax extends SyntaxNode {}

export class SyntaxException extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class PrimaryExpression extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class ColumnReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class RowReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class CellReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string, public Column: ColumnReference, public Row: RowReference) {
    super(Kind);
  }
}

export class RangeReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string, public Left: CellReference, public Right: CellReference) {
    super(Kind);
  }
}

export class BinaryExpression extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxToken, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class UnaryExpression extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxToken, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesisExpression extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Left: SyntaxToken, public Expression: ExpressionSyntax, public Right: SyntaxToken) {
    super(Kind);
  }
}

export class ReferenceStatement extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Reference: string, public Expression: ExpressionSyntax, public Referencing: Array<string>) {
    super(Kind);
  }
}

export class SyntaxTree extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Tree: ReferenceStatement) {
    super(Kind);
  }
}
