import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { Cell } from "./bound.scope";

export class BoundCellReference extends BoundNode {
  constructor(public name: string, public value: Cell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
