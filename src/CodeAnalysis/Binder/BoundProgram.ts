import { BoundScope } from "./BoundScope";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundProgram extends BoundStatement {
  constructor(public Kind: BoundKind, public Root: Array<BoundStatement>, public Scope: BoundScope) {
    super(Kind);
  }
}
