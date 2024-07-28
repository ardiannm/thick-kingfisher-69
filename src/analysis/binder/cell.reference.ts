import { BoundNode } from "./bound.node";
import { Cell } from "../../runtime/cell";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";

export class BoundCellReference extends BoundNode {
  constructor(public cell: Cell, public span: Span) {
    super(BoundKind.CellReference);
  }
}
