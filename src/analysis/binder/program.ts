import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundProgram extends BoundStatement {
  constructor(public override kind: BoundKind.Program, public statements: Array<BoundStatement>) {
    super(kind);
  }
}
