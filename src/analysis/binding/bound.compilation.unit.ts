import { BoundScope } from "./bound.scope";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";
import { BoundNode } from "./bound.node";

export class BoundCompilationUnit extends BoundNode {
  constructor(public scope: BoundScope, public root: Array<BoundNode>, public override span: Span) {
    super(BoundKind.BoundCompilationUnit, span);
  }
}
