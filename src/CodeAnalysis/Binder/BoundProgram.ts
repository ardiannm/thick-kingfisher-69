import { BoundKind } from "./Kind/BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundProgram extends BoundStatement {
  constructor(public override Kind: BoundKind.Program, public Root: Array<BoundStatement>) {
    super(Kind);
  }
}
