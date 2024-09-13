import { BoundCell, BoundCellReference } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCell>();
  references = new Array<BoundCellReference>();
  constructor(public parent: BoundScope | null) {}
}
