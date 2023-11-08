import { Syntax } from "./Syntax";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public kind: Syntax) {}
}

export class NumberNode extends SyntaxNode {
  constructor(public kind: Syntax, public value: string) {
    super(kind);
  }
}

export class BadNode extends SyntaxNode {
  constructor(public kind: Syntax, public value: string) {
    super(kind);
  }
}

export class IdentifierNode extends SyntaxNode {
  constructor(public kind: Syntax, public value: string) {
    super(kind);
  }
}

export class ColumnNode extends SyntaxNode {
  constructor(public kind: Syntax, public repr: string) {
    super(kind);
  }
}

export class RowNode extends SyntaxNode {
  constructor(public kind: Syntax, public repr: string) {
    super(kind);
  }
}

export class CellNode extends SyntaxNode {
  constructor(public kind: Syntax, public column: ColumnNode, public row: RowNode) {
    super(kind);
  }
}

export class RangeNode extends SyntaxNode {
  constructor(public kind: Syntax, public left: CellNode, public right: CellNode) {
    super(kind);
  }
}

abstract class ExpressionNode extends SyntaxNode {}

export class BinaryNode extends ExpressionNode {
  constructor(public kind: Syntax, public left: SyntaxNode, public operator: string, public right: SyntaxNode) {
    super(kind);
  }
}

export class UnaryNode extends ExpressionNode {
  constructor(public kind: Syntax, public operator: string, public right: SyntaxNode) {
    super(kind);
  }
}

export class ParenthesisNode extends ExpressionNode {
  constructor(public kind: Syntax, public left: SyntaxToken, public expression: ExpressionNode, public right: SyntaxToken) {
    super(kind);
  }
}

export class ReferenceNode extends ExpressionNode {
  constructor(public kind: Syntax, public reference: string, public expression: ExpressionNode, public observing: Array<string>) {
    super(kind);
  }
}
