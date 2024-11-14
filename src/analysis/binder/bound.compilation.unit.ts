import { BoundScope } from "./bound.scope";
import { BoundStatement } from "./bound.statement";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public scope: BoundScope, public root: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundCompilationUnit, span);
  }
}
