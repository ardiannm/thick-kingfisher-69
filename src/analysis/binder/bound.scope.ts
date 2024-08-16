import { SyntaxCellReference } from "../parser/syntax.cell.reference";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundDefaultZero } from "./bound.default.zero";
import { BoundExpression } from "./bound.expression";

export class BoundScope {
  stack = new Map<string, BoundCellReference>();
  private expressions = new Map<string, BoundExpression>();

  constructor(public parent: BoundScope | null) {}

  setExpression(reference: BoundCellReference) {
    this.expressions.set(reference.name, reference);
  }

  getExpression(node: SyntaxCellReference) {
    const prevNode = this.expressions.get(node.text) as BoundCellReference;
    if (prevNode) return prevNode;
    return new BoundDefaultZero(node.span);
  }

  bind(node: SyntaxCellReference, expression: BoundExpression) {
    const bound = new BoundCellReference(node.text, expression, 0, node.span);
    this.stack.set(bound.name, bound);
    return bound;
  }
}
