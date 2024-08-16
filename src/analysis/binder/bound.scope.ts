import { BoundCellReference } from "./bound.cell.reference";
import { BoundExpression } from "./bound.expression";

export class BoundScope {
  stack = new Map<string, BoundCellReference>();
  expressions = new Map<string, BoundExpression>();

  constructor(public parent: BoundScope | null) {}

  register(reference: BoundCellReference) {
    this.stack.set(reference.name, reference);
  }
}
