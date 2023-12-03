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
      // Keep Existing Observers
      Node.ReferencedBy = PrevNode.ReferencedBy;
      // Clear Previous Subscriptions
      PrevNode.Referencing.forEach((Reference) => this.GetNode(Reference).Unsubscribe(Node));
    }
    // Subscribe To The Nodes That Is Referencing For Change Observations
    Node.Referencing.forEach((Reference) => this.GetNode(Reference).Subscribe(Node));
    // Keep The Node Structure For Future Re Evaluations
    this.SetNode(Node);
    this.SetValue(Node, Value);
    return this.OnChange(Node);
  }

  private HasNode(Node: BoundReferenceAssignment): boolean {
    return this.ReferenceNodes.has(Node.Reference);
  }

  private GetNode(Reference: string) {
    return this.ReferenceNodes.get(Reference);
  }

  private SetNode(Node: BoundReferenceAssignment) {
    return this.ReferenceNodes.set(Node.Reference, Node);
  }

  SetValue(Node: BoundReferenceAssignment, Value: number) {
    this.ReferenceValues.set(Node.Reference, Value);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.ReferenceValues.has(Node.Reference)) return this.ReferenceValues.get(Node.Reference);
    this.Logger.ValueDoesNotExist(Node.Reference);
  }

  // Handle Effected Node References On Change
  private *OnChange(Node: BoundReferenceAssignment): Generator<BoundReferenceAssignment> {
    this.ForChange.clear();
    this.RegisterEffected(Node);
    for (const Changed of this.ForChange) {
      yield this.GetNode(Changed);
    }
    this.ForChange.clear();
  }

  // Detect OutDated Dependecies After Change
  private RegisterEffected(Node: BoundReferenceAssignment) {
    this.ReferenceNodes.get(Node.Reference).ReferencedBy.forEach((Reference) => {
      this.ForChange.add(Reference);
      this.RegisterEffected(this.GetNode(Reference));
    });
  }
}
