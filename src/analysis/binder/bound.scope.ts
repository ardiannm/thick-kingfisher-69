import { BoundCell } from "../binder";
import { SyntaxExpression } from "../parser/syntax.expression";

export class BoundScope {
  expressions = new Map<string, SyntaxExpression>();
  cells = new Map<string, BoundCell>();
  constructor(public parent: BoundScope | null) {}
}
