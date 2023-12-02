import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}
  private ReferenceNodes = new Map<string, BoundReferenceAssignment>();
  private ReferenceValues = new Map<string, number>();

  Set(Bound: BoundReferenceAssignment, Value: number) {
    const Ref = Bound.Reference;
    this.ReferenceNodes.set(Ref, Bound);
    this.ReferenceValues.set(Ref, Value);
  }

  Get(Bound: BoundCellReference) {
    if (this.ReferenceValues.has(Bound.Reference)) return this.ReferenceValues.get(Bound.Reference);
    this.Logger.ValueDoesNotExist(Bound.Reference);
  }
}
