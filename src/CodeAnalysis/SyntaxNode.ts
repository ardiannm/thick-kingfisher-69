import { SyntaxKind } from "./SyntaxKind";

export abstract class SyntaxNode {
  constructor(public Node: SyntaxKind) {}
}

abstract class Expression extends SyntaxNode {}

export class NumberExpression extends SyntaxNode {
  constructor(public Node: SyntaxKind, public Text: string) {
    super(Node);
  }
}

export class IdentifierExpression extends SyntaxNode {
  constructor(public Node: SyntaxKind, public Text: string) {
    super(Node);
  }
}

export class CellReference extends SyntaxNode {
  constructor(public Node: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Node);
  }
}

export class RangeReference extends SyntaxNode {
  constructor(public Node: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Node);
  }
}

export class ParenthesizedExpression extends Expression {
  constructor(public Node: SyntaxKind, public Left: SyntaxNode, public Expression: SyntaxNode, public Right: SyntaxNode) {
    super(Node);
  }
}

export class UnaryExpression extends Expression {
  constructor(public Node: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Node);
  }
}

export class BinaryExpression extends Expression {
  constructor(public Node: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Node);
  }
}

export class ReferenceDeclaration extends Expression {
  constructor(public Node: SyntaxKind, public Reference: SyntaxNode, public Referencing: Array<string>, public Expression: SyntaxNode) {
    super(Node);
  }
}
