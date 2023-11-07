import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public kind: SyntaxKind) {}
}

export class NumberNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public value: string) {
    super(kind);
  }
}

export class BadNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public value: string) {
    super(kind);
  }
}

export class IdentifierNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public value: string) {
    super(kind);
  }
}

export class ColumnNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public repr: string) {
    super(kind);
  }
}

export class RowNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public repr: string) {
    super(kind);
  }
}

export class CellNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public column: ColumnNode, public row: RowNode) {
    super(kind);
  }
}

export class RangeNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public left: CellNode, public right: CellNode) {
    super(kind);
  }
}

abstract class ExpressionNode extends SyntaxNode {}

export class BinaryNode extends ExpressionNode {
  constructor(public kind: SyntaxKind, public left: SyntaxNode, public operator: string, public right: SyntaxNode) {
    super(kind);
  }
}

export class UnaryNode extends ExpressionNode {
  constructor(public kind: SyntaxKind, public operator: string, public right: SyntaxNode) {
    super(kind);
  }
}

export class ParenthesisNode extends ExpressionNode {
  constructor(public kind: SyntaxKind, public left: SyntaxToken, public expression: ExpressionNode, public right: SyntaxToken) {
    super(kind);
  }
}
