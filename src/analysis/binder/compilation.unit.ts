import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public statements: Array<BoundStatement>) {
    super(BoundKind.CompilationUnit);
  }
}
