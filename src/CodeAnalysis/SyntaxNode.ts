import { SyntaxKind } from "./SyntaxKind";

export class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}
}

export class Expression extends SyntaxNode {}

export class CellReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class RangeReference extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesizedExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Expression: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class UnaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class BinaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ReferenceDeclaration extends Expression {
  constructor(public Kind: SyntaxKind, public Reference: SyntaxNode, public Referencing: Array<string>, public Expression: SyntaxNode) {
    super(Kind);
  }
}
