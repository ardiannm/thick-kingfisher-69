import { Span } from "../../lexing/span";
import { BoundScope } from "./bound.scope";
import { BoundStatement } from "./bound.statement";
import { BoundKind } from "./kind/bound.kind";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public scope: BoundScope, public root: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundCompilationUnit, span);
  }
}
