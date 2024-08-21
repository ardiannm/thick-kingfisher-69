import { Span } from "../text/span";
import { BoundBinaryExpression } from "./binary.expression";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundExpression } from "./bound.expression";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: BoundCellReference, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);
  }

  track<Kind extends BoundNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case BoundKind.BoundBinaryExpression:
        return this.trackBoundBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.BoundCellReference:
        return this.trackBoundCellReference(node as NodeType<BoundCellReference>);
      case BoundKind.BoundNumericLiteral:
        return node;
    }
    this.tree.diagnostics.trackMethod(node.kind, node.span);
    return node;
  }

  private trackBoundCellReference(node: BoundCellReference): BoundNode {
    this.track(node.cell.expression);
    return node;
  }

  private trackBoundBinaryExpression(node: BoundBinaryExpression) {
    this.track(node.left);
    this.track(node.right);
    return node;
  }
}
