import { BoundKind } from "./kind/bound.kind";
import { BoundScope } from "./scope";
import { BoundStatement } from "./statement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public name: string, public scope: BoundScope, public statements: Array<BoundStatement>) {
    super(BoundKind.FunctionExpression);
  }
}
