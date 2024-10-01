import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./bound.statement";
import { Span } from "../text/span";
import { BoundScope } from "./bound.scope";
import { SyntaxCompilationUnit } from "../parser/syntax.compilation.unit";
import { Binder } from "../binder";

export class BoundCompilationUnit extends BoundStatement {
  constructor(public scope: BoundScope, public root: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundCompilationUnit, span);
  }

  static createFrom(node: SyntaxCompilationUnit) {
    return new Binder().bindSyntaxCompilationUnit(node);
  }
}
