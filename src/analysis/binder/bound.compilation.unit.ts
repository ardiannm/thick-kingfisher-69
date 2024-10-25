import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./bound.statement";
import { Span } from "../text/span";
import { BoundScope } from "./bound.scope";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public scope: BoundScope, public root: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundCompilationUnit, span);
  }
}
