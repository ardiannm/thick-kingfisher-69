import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public override Kind: BoundKind.FunctionExpression, public Name: string, public Statements: Array<BoundStatement>) {
    super(Kind);
  }
}
