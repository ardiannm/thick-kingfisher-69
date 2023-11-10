import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class Syntax {
  constructor(public kind: SyntaxKind) {}
}

abstract class ExpressionNode extends Syntax {}

export class Exception extends Syntax {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class PrimaryExpression extends Syntax {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class ColumnReference extends Syntax {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class RowReference extends Syntax {
  constructor(public kind: SyntaxKind, public text: string) {
    super(kind);
  }
}

export class CellReference extends Syntax {
  constructor(public kind: SyntaxKind, public text: string, public column: ColumnReference, public row: RowReference) {
    super(kind);
  }
}

export class RangeReference extends Syntax {
  constructor(public kind: SyntaxKind, public text: string, public left: CellReference, public right: CellReference) {
    super(kind);
  }
}

export class BinaryExpression extends ExpressionNode {
  constructor(public kind: SyntaxKind, public left: Syntax, public operator: SyntaxToken, public right: Syntax) {
    super(kind);
  }
}

export class UnaryExpression extends ExpressionNode {
  constructor(public kind: SyntaxKind, public operator: SyntaxToken, public right: Syntax) {
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

export class SyntaxTree extends Syntax {
  constructor(public kind: SyntaxKind, public tree: ReferenceStatement) {
    super(kind);
  }
}
