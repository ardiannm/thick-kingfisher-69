import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

// Environment class manages the state of the program's variables and handles change observations.

export class Environment {
  // Map to store bound reference assignments.
  private Nodes = new Map<string, BoundReferenceAssignment>();
  // Map to store values of cell references.
  private Values = new Map<string, number>();
  // Set to keep track of nodes that need to be re-evaluated due to changes.
  private ForChange = new Set<string>();

  // Logger for reporting diagnostics and errors during environment operations.
  private Logger = new Diagnostics();

  // Checks if the environment has a specific node.
  private HasNode(Node: BoundReferenceAssignment): boolean {
    return this.Nodes.has(Node.Reference);
  }

  // Retrieves a node from the environment based on its reference.
  private GetNode(Reference: string) {
    return this.Nodes.get(Reference);
  }

  // Sets a node in the environment.
  private SetNode(Node: BoundReferenceAssignment) {
    return this.Nodes.set(Node.Reference, Node);
  }

  // Sets the value of a node in the environment.
  SetValue(Node: BoundReferenceAssignment, Value: number) {
    this.Values.set(Node.Reference, Value);
  }

  // Retrieves the value of a cell reference from the environment.
  GetValue(Node: BoundCellReference): number {
    if (this.Values.has(Node.Reference)) return this.Values.get(Node.Reference);
    throw this.Logger.ValueDoesNotExist(Node.Reference);
  }

  // Assigns a value to a bound reference assignment and triggers change observations.
  Assign(Node: BoundReferenceAssignment, Value: number): Generator<BoundReferenceAssignment> {
    // If the node is stored.
    if (this.HasNode(Node)) {
      const PrevNode = this.GetNode(Node.Reference);
      // Keep existing observers.
      Node.ReferencedBy = PrevNode.ReferencedBy;
      // Clear previous subscriptions.
      PrevNode.Referencing.forEach((Reference) => {
        if (!Node.Referencing.includes(Reference)) this.GetNode(Reference).Unsubscribe(Node);
      });
    }
    // Subscribe to the nodes that are referencing for change observations.
    Node.Referencing.forEach((Reference) => this.GetNode(Reference).Subscribe(Node));
    // Keep the node structure for future re-evaluations.
    this.SetNode(Node);
    this.SetValue(Node, Value);
    return this.OnEdit(Node);
  }

  // Handle affected node references on change.
  private *OnEdit(Node: BoundReferenceAssignment): Generator<BoundReferenceAssignment> {
    this.ForChange.clear();
    this.DetectForChanges(Node);
    for (const Changed of this.ForChange) {
      yield this.GetNode(Changed);
    }
    this.ForChange.clear();
  }

  // Detect outdated dependencies after change.
  private DetectForChanges(Node: BoundReferenceAssignment) {
    this.Nodes.get(Node.Reference).ReferencedBy.forEach((Reference) => {
      this.ForChange.add(Reference);
      this.DetectForChanges(this.GetNode(Reference));
    });
  }
}
