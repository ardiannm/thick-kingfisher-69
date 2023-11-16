import { SyntaxKind } from "./SyntaxKind";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}
}

abstract class ExpressionSyntax extends SyntaxNode {}

export class BadSyntax extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class PrimarySyntax extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class CellSyntax extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Column: string, public Row: string) {
    super(Kind);
  }
}

export class RangeSyntax extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class BinarySyntax extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class UnarySyntax extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesisSyntax extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Expression: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ReferenceSyntax extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Reference: SyntaxNode, public Expression: SyntaxNode, public Referencing: Array<string>) {
    super(Kind);
  }
}
