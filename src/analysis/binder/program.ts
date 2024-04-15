import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundProgram extends BoundStatement {
  constructor(public override Kind: BoundKind.Program, public Root: Array<BoundStatement>) {
    super(Kind);
  }
}
