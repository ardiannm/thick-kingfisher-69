import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public override kind: BoundKind.CompilationUnit, public statements: Array<BoundStatement>) {
    super(kind);
  }
}
