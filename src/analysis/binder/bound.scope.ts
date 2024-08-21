import { BoundCell } from "./bound.cell";

export class BoundScope {
  cells = new Map<string, BoundCell>();

  constructor(public parent: BoundScope | null) {}
}
