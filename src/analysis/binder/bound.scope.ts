import { BoundCellAssignment } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCellAssignment>();
  constructor(public parent: BoundScope | null) {}
}
