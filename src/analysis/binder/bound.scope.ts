import { BoundCell } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCell>();
  constructor(public parent: BoundScope | null) {}
}
