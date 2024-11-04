import { BoundCellReference } from "./bound.cell.reference";
import { BoundCellAssignment } from "./bound.cell.assignment";

export class BoundScope {
  observers = new Map() as Map<string, Set<BoundCellAssignment>>;
  assignments = new Map() as Map<string, BoundCellAssignment>;
  references = [] as BoundCellReference[];

  constructor(public parent?: BoundScope) {}
}
