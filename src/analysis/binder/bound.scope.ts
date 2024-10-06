import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  references = new Array<BoundCellReference>();
  assignments = new Map<string, BoundCellAssignment>();
  observers = new Map<string, Set<BoundCellAssignment>>();

  constructor(public parent: BoundScope | null) {}
}
