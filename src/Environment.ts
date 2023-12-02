import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}
  private ReferenceNodes = new Map<string, BoundReferenceAssignment>();
  private ReferenceValues = new Map<string, number>();
  private ForChange = new Set<string>();

  Set(Bound: BoundReferenceAssignment, Value: number) {
    const Ref = Bound.Reference;
    this.ReferenceNodes.set(Ref, Bound);
    this.ReferenceValues.set(Ref, Value);
    this.DetectAfterChange(Ref);
  }

  Get(Bound: BoundCellReference) {
    if (this.ReferenceValues.has(Bound.Reference)) return this.ReferenceValues.get(Bound.Reference);
    this.Logger.ValueDoesNotExist(Bound.Reference);
  }

  // Detect OutDated Dependecies After Change
  private DetectAfterChange(Reference: string) {
    this.ReferenceNodes.get(Reference).ReferencedBy.forEach((Ref) => {
      this.ForChange.add(Ref);
      this.DetectAfterChange(Ref);
    });
  }
}
