import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";
import { Cell } from "./bound.scope";
import { BoundDefaultZero } from "./bound.default.zero";

export class BoundCellReference extends BoundNode {
  private _expression = new BoundDefaultZero(this.span);

  constructor(public name: string, public declared: boolean, public cell: Cell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }

  set expression(expr: BoundExpression) {
    this._expression = expr;
  }

  get expression() {
    return this._expression;
  }

  observe(dependency: BoundCellReference): void {
    this.cell.dependencies.set(dependency.name, dependency);
    dependency.cell.observers.set(this.name, this);
  }

  clearGraph() {
    this.cell.dependencies.forEach((dependency) => dependency.cell.observers.delete(this.name));
    this.cell.dependencies.clear();
  }

  getEdges(map = new Map<string, BoundCellReference>()) {
    this.cell.observers.forEach((observer) => {
      if (observer.cell.observers.size) {
        observer.getEdges(map);
      } else {
        map.set(observer.name, observer);
      }
    });
    return map;
  }
}
