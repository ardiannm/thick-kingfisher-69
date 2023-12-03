import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}

  private ReferenceNodes = new Map<string, BoundReferenceAssignment>();
  private ReferenceValues = new Map<string, number>();
  private ForChange = new Set<string>();

  Assign(Node: BoundReferenceAssignment, Value: number): Generator<BoundReferenceAssignment> {
    // If Node Is Stored

    if (this.HasNode(Node)) {
      const PrevNode = this.GetNode(Node.Reference);

      // Copy Existing Subscribers
      Node.ReferencedBy = PrevNode.ReferencedBy;

      // Remove Previous Subscriptions
      PrevNode.Referencing.forEach((Reference) => this.GetNode(Reference).Unsubscribe(Node));
    }

    // Subscribe To What The Node Is Referencing For Change Observations
    Node.Referencing.forEach((Reference) => this.GetNode(Reference).Subscribe(Node));

    // Store Node Structure For Re Evaluation
    this.ReferenceNodes.set(Node.Reference, Node);

    this.Set(Node.Reference, Value);
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
  private *OnChange(Bound: BoundReferenceAssignment): Generator<BoundReferenceAssignment> {
    this.ForChange.clear();
    this.RegisterOutDated(Bound);
    for (const Changed of this.ForChange) {
      yield this.GetNode(Changed);
    }
    this.ForChange.clear();
  }

  // Detect OutDated Dependecies After Change
  private RegisterOutDated(Bound: BoundReferenceAssignment) {
    this.ReferenceNodes.get(Bound.Reference).ReferencedBy.forEach((Reference) => {
      this.ForChange.add(Reference);
      this.RegisterOutDated(this.GetNode(Reference));
    });
  }
}
