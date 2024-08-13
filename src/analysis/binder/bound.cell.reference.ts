import { BoundNode } from "./bound.node";
import { Cell } from "../../runtime/cell";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";

export class BoundCellReference extends BoundNode {
  constructor(public reference: Cell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
