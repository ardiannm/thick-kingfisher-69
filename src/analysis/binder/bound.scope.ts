import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCellAssignment>();
  references = new Array<BoundCellReference>();
  constructor(public parent: BoundScope | null) {}

  report(node: BoundCellAssignment) {
    return {
      message: `aftering binding and assigning node in line ${node.span.line}`,
      state: [...this.assignments.values()].map((node) => node.report()).sort((a, b) => a.line - b.line),
    };
  }
}
