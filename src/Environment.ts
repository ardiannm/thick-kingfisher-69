import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}

  private ReferenceNodes = new Map<string, BoundReferenceAssignment>();
  private ReferenceValues = new Map<string, number>();
  private ForChange = new Set<string>();

  Assign(Node: BoundReferenceAssignment, Value: number): Array<BoundReferenceAssignment> {
    // If Node Is Stored

    if (this.HasNode(Node)) {
      const PrevNode = this.GetNode(Node.Reference);

      // Copy Existing Subscribers
      Node.ReferencedBy = PrevNode.ReferencedBy;

      // Unsubscribe From Previous Nodes
      PrevNode.Referencing.forEach((Reference) => this.GetNode(Reference).Unsubscribe(Node));
    }

    // Subscribe To Current Nodes For Change Observations
    Node.Referencing.forEach((Reference) => this.GetNode(Reference).Subscribe(Node));

    // Store Node Structure For Re Evaluation
    this.ReferenceNodes.set(Node.Reference, Node);

    // Set Node Value From Evaluation
    this.Set(Node.Reference, Value);

    // Return The List Of OutDated References
    return this.OnChange(Node);
  }

  private HasNode(Node: BoundReferenceAssignment): boolean {
    return this.ReferenceNodes.has(Node.Reference);
  }

  private GetNode(Reference: string) {
    return this.ReferenceNodes.get(Reference);
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
    this.ReferenceNodes.get(Bound.Reference).ReferencedBy.forEach((Reference) => {
      this.ForChange.add(Reference);
      this.RegisterOutDated(this.GetNode(Reference));
    });
  }
}
