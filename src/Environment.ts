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
    // If Node Reference Is Already Stored Copy Existing Subscribers

    if (this.ReferenceNodes.has(Bound.Reference)) {
      const Node = this.ReferenceNodes.get(Bound.Reference);
      Bound.ReferencedBy = Node.ReferencedBy;

      // And Unsubcribe From The Nodes That Are No Longer Being Referenced
      Node.Referencing.forEach((Reference) => {
        if (!Bound.Referencing.includes(Reference)) this.ReferenceNodes.get(Reference).UnSubscribe(Bound);
      });
    }

    // Subscribe To Referencing Nodes For Observing Changes
    Bound.Referencing.forEach((Ref) => this.ReferenceNodes.get(Ref).Subscribe(Bound));

    // Store Node Structure For Re Evaluation
    this.ReferenceNodes.set(Bound.Reference, Bound);

    // Set Node Value From Evaluation
    this.Set(Bound.Reference, Value);

    // Return The List Of OutDated References
    return this.OnChange(Bound);
  }

  Set(Reference: string, Value: number) {
    this.ReferenceValues.set(Reference, Value);
  }

  Get(Bound: BoundCellReference) {
    if (this.ReferenceValues.has(Bound.Reference)) return this.ReferenceValues.get(Bound.Reference);
    this.Logger.ValueDoesNotExist(Bound.Reference);
  }

  // Handle OutDated Bound References On Change
  private OnChange(Bound: BoundReferenceAssignment): Array<BoundReferenceAssignment> {
    this.ForChange.clear();
    this.RegisterOutDated(Bound);
    const OutDatedBounds = Array.from(this.ForChange).map((OutDated) => this.ReferenceNodes.get(OutDated));
    this.ForChange.clear();
    return OutDatedBounds;
  }

  // Detect OutDated Dependecies After Change
  private RegisterOutDated(Bound: BoundReferenceAssignment) {
    this.ReferenceNodes.get(Bound.Reference).ReferencedBy.forEach((Subscriber) => {
      this.ForChange.add(Subscriber.Reference);
      this.RegisterOutDated(Subscriber);
    });
  }
}
