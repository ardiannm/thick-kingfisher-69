import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public kind: SyntaxKind) {}
}

abstract class ExpressionNode extends SyntaxNode {}

export class Exception extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class PrimaryExpression extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class ColumnReference extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class RowReference extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class CellReference extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string, public column: ColumnReference, public row: RowReference) {
    super(kind);
  }
}

export class RangeReference extends SyntaxNode {
  constructor(public kind: SyntaxKind, public text: string, public left: CellReference, public right: CellReference) {
    super(kind);
  }
}

export class BinaryExpression extends ExpressionNode {
  constructor(public kind: SyntaxKind, public left: SyntaxNode, public operator: SyntaxToken, public right: SyntaxNode) {
    super(kind);
  }
}

export class UnaryExpression extends ExpressionNode {
  constructor(public kind: SyntaxKind, public operator: SyntaxToken, public right: SyntaxNode) {
    super(kind);
  }
}

export class ParenthesisExpression extends ExpressionNode {
  constructor(public kind: SyntaxKind, public left: SyntaxToken, public expression: ExpressionNode, public right: SyntaxToken) {
    super(kind);
  }
}

export class ReferenceStatement extends ExpressionNode {
  constructor(public kind: SyntaxKind, public reference: string, public expression: ExpressionNode, public referencing: Array<string>) {
    super(kind);
  }
}

export class SyntaxTree extends SyntaxNode {
  constructor(public kind: SyntaxKind, public tree: ReferenceStatement) {
    super(kind);
  }
}
