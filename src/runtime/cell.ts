import { BoundExpression } from "../analysis/binder/bound.expression";
import { BoundScope } from "../analysis/binder/bound.scope";

export class Cell {
  private constructor(public value: number, public name: string, public expression: BoundExpression) {}

  static createFrom(scope: BoundScope, name: string, expression: BoundExpression) {
    const reference = new Cell(0, name, expression);
    scope.references.set(name, reference);
    return reference;
  }
}
