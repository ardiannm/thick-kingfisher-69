import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}
}

abstract class ExpressionSyntaxNode extends SyntaxNode {}

export class BadSyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class PrimarySyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class ColumnSyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class RowSyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class CellSyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string, public Column: ColumnSyntaxNode, public Row: RowSyntaxNode) {
    super(Kind);
  }
}

export class RangeSyntaxNode extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string, public Left: CellSyntaxNode, public Right: CellSyntaxNode) {
    super(Kind);
  }
}

export class BinarySyntaxNode extends ExpressionSyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxToken, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class UnarySyntaxNode extends ExpressionSyntaxNode {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxToken, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesisSyntaxNode extends ExpressionSyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxToken, public Expression: ExpressionSyntaxNode, public Right: SyntaxToken) {
    super(Kind);
  }
}

export class ReferenceSyntaxNode extends ExpressionSyntaxNode {
  constructor(public Kind: SyntaxKind, public Reference: string, public Expression: ExpressionSyntaxNode, public Referencing: Array<string>) {
    super(Kind);
  }
}
