import { BoundKind } from "./kind/bound.kind";
import { Environment } from "../../runtime/environment";
import { BoundStatement } from "./statement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public name: string, public scope: Environment, public statements: Array<BoundStatement>) {
    super(BoundKind.FunctionExpression);
  }
}
