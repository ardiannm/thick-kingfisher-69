import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundScope } from "./bound.scope";
import { BoundExpression } from "./bound.expression";

export class BoundCell extends BoundNode {
  constructor(public scope: BoundScope, public name: string, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCell, span);
    if (this.scope.declarations.has(this.name)) {
      this.expression = this.scope.declarations.get(this.name) as BoundCell;
    }
    this.scope.declarations.set(this.name, this);
    this.value = 0;
  }

  get value() {
    return this.scope.values.get(this.name) as number;
  }

  set value(n: number) {
    this.scope.values.set(this.name, n);
  }
}
