import { BoundKind } from "./Kind/BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundFunctionExpression extends BoundStatement {
  constructor(public override Kind: BoundKind.FunctionExpression, public FunctionName: string, public Statements: Array<BoundStatement>) {
    super(Kind);
  }
}
