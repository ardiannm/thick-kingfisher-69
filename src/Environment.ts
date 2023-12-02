import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}
  private ReferenceNodes = new Map<string, BoundReferenceAssignment>();
  private ReferenceValues = new Map<string, number>();
  private ForChange = new Set<string>();

  // A1->3; A2->A1+7; A3->A1+A2+5;

  Assign(Bound: BoundReferenceAssignment, Value: number): Array<BoundReferenceAssignment> {
    if (this.ReferenceNodes.has(Bound.Reference)) {
      const PrevNode = this.ReferenceNodes.get(Bound.Reference);
      Bound.ReferencedBy = PrevNode.ReferencedBy;
      const RemovedRefs = PrevNode.Referencing.filter((Ref) => !Bound.Referencing.includes(Ref));
      RemovedRefs.forEach((Ref) => this.ReferenceNodes.get(Ref).UnSubscribe(Bound.Reference));
    }

    Bound.Referencing.forEach((Ref) => this.ReferenceNodes.get(Ref).Subscribe(Bound.Reference));
    this.ReferenceNodes.set(Bound.Reference, Bound);
    this.Set(Bound.Reference, Value);

    this.ForChange.clear();
    this.DetectAfterChange(Bound.Reference);
    const OutDatedBounds = Array.from(this.ForChange).map((Ref) => this.ReferenceNodes.get(Ref));
    this.ForChange.clear();
    return OutDatedBounds;
  }

  Set(Reference: string, Value: number) {
    this.ReferenceValues.set(Reference, Value);
    return Value;
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
