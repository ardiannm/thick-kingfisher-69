import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { Cell } from "./bound.scope";
import { BoundExpression } from "./bound.expression";

export class BoundCellReference extends BoundNode {
  constructor(public name: string, public cell: Cell, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }

  observe(node: BoundCellReference) {
    this.cell.dependencies.set(node.name, node);
    node.cell.observers.set(this.name, this);
  }

  loggerLog() {
    console.log(this.span.line, this.name);
    console.log(this.cell.dependencies);
    console.log(this.cell.observers);
    console.log("");
  }
}
