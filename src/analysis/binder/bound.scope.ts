import { BoundCellReference } from "./bound.cell.reference";
import { BoundCellAssignment } from "./bound.cell.assignment";

export class BoundScope {
  references = [] as BoundCellReference[];
  assignments = new Map() as Map<string, BoundCellAssignment>;
  observers = new Map() as Map<string, Set<BoundCellAssignment>>;

  constructor(public parent?: BoundScope) {}
}
