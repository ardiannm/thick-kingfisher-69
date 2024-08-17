import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundScope } from "./bound.scope";
import { BoundExpression } from "./bound.expression";
import { BoundCellReference } from "./bound.cell.reference";

export class BoundCell extends BoundNode {
  dependencies = new Map<string, BoundCell>();

  constructor(public scope: BoundScope, public name: string, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCell, span);
    if (this.scope.declarations.has(this.name)) {
      this.expression = this.scope.declarations.get(this.name) as BoundCell;
    }
    this.scope.declarations.set(this.name, this);
    this.value = 0;
    this.observe(this.scope.references);
    this.scope.references.clear();
    console.log(this.name, this.expression);
  }

  get value() {
    return this.scope.values.get(this.name) as number;
  }

  set value(n: number) {
    this.scope.values.set(this.name, n);
  }

  observe(references: Map<string, BoundCellReference>) {
    references.forEach((r) => this.dependencies.set(r.name, r.cell));
  }
}
