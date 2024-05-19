import { BoundKind } from "./kind/bound.kind";
import { BoundScope } from "./scope";
import { BoundStatement } from "./statement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public override Kind: BoundKind.FunctionExpression, public Name: string, public Scope: BoundScope, public Statements: Array<BoundStatement>) {
    super(Kind);
  }
}
