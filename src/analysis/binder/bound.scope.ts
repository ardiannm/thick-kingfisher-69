import { SyntaxExpression } from "../parser/syntax.expression";

export class BoundScope {
  expressions = new Map<string, SyntaxExpression>();
  constructor(public parent: BoundScope | null) {}
}
