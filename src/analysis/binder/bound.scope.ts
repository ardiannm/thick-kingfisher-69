import { BoundCell } from "./bound.cell";
import { BoundCellReference } from "./bound.cell.reference";

export class BoundScope {
  values = new Map<string, number>();
  declarations = new Map<string, BoundCell>();
  references = new Map<string, BoundCellReference>();

  constructor(public parent: BoundScope | null) {}
}
