import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./bound.statement";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public root: Array<BoundStatement>) {
    super(BoundKind.BoundCompilationUnit);
  }
}
