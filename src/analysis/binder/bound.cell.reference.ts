import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { Cell } from "../../runtime/cell";

export class BoundCellReference extends BoundNode {
  constructor(public cell: Cell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
