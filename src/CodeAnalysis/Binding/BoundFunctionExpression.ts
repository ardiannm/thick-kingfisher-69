import { BoundKind } from "./Kind/BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public override Kind: BoundKind.FunctionExpression, public Name: string, public Statements: Array<BoundStatement>) {
    super(Kind);
  }
}
