import { SyntaxKind } from "./SyntaxKind";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}
}

abstract class Expression extends SyntaxNode {}

export class NumberExpression extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class IdentifierExpression extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}

export class CellReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Column: SyntaxNode, public Row: SyntaxNode) {
    super(Kind);
  }
}

export class RangeReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class BinaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class UnaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesizedExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Expression: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ReferenceDeclaration extends Expression {
  constructor(public Kind: SyntaxKind, public Reference: SyntaxNode, public Expression: SyntaxNode, public Referencing: Array<string>) {
    super(Kind);
  }
}
