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

  print() {
    var struct = "after processing line " + this.span.line + ", cell " + this.name + " has these:";
    struct += "\n{";
    struct += "\n\tdependencies: ";
    this.cell.dependencies.forEach((u) => (struct += u.name + " "));
    struct += ",\n\tobservers: ";
    this.cell.observers.forEach((u) => (struct += u.name + " "));
    struct += ",\n}";
    console.log(struct);
    return struct;
  }
}
