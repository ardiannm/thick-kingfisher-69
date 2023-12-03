import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Environment {
  constructor(public Logger: Diagnostics) {}

  private Nodes = new Map<string, BoundReferenceAssignment>();
  private Values = new Map<string, number>();
  private ForChange = new Set<string>();

  private HasNode(Node: BoundReferenceAssignment): boolean {
    return this.Nodes.has(Node.Reference);
  }

  private GetNode(Reference: string) {
    return this.Nodes.get(Reference);
  }

  private SetNode(Node: BoundReferenceAssignment) {
    return this.Nodes.set(Node.Reference, Node);
  }

  SetValue(Node: BoundReferenceAssignment, Value: number) {
    this.Values.set(Node.Reference, Value);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.Values.has(Node.Reference)) return this.Values.get(Node.Reference);
    this.Logger.ValueDoesNotExist(Node.Reference);
  }

  Assign(Node: BoundReferenceAssignment, Value: number): Generator<BoundReferenceAssignment> {
    // If Node Is Stored
    if (this.HasNode(Node)) {
      const PrevNode = this.GetNode(Node.Reference);
      // Keep Existing Observers
      Node.ReferencedBy = PrevNode.ReferencedBy;
      // Clear Previous Subscriptions
      PrevNode.Referencing.forEach((Reference) => {
        if (!Node.Referencing.includes(Reference)) this.GetNode(Reference).Unsubscribe(Node);
      });
    }
    // Subscribe To The Nodes That Is Referencing For Change Observations
    Node.Referencing.forEach((Reference) => this.GetNode(Reference).Subscribe(Node));
    // Keep The Node Structure For Future Re Evaluations
    this.SetNode(Node);
    this.SetValue(Node, Value);
    return this.OnEdit(Node);
  }

  // Handle Effected Node References On Change
  private *OnEdit(Node: BoundReferenceAssignment): Generator<BoundReferenceAssignment> {
    this.ForChange.clear();
    this.DetectForChanges(Node);
    for (const Changed of this.ForChange) {
      yield this.GetNode(Changed);
    }
    this.ForChange.clear();
  }

  // Detect OutDated Dependecies After Change
  private DetectForChanges(Node: BoundReferenceAssignment) {
    this.Nodes.get(Node.Reference).ReferencedBy.forEach((Reference) => {
      this.ForChange.add(Reference);
      this.DetectForChanges(this.GetNode(Reference));
    });
  }
}
