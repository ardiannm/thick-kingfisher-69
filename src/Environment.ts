import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundCell } from "./CodeAnalysis/Binding/BoundCell";

export class Environment {
  private Nodes = new Map<string, BoundCell>();
  private NodeValues = new Map<string, number>();
  private Diagnostics: DiagnosticBag = new DiagnosticBag();

  Stack = new Set<string>();

  ReferToCell(Node: BoundCellReference): void {
    this.Stack.add(Node.Reference);
  }

  Declare(Node: BoundCell): BoundCell {
    if (Node.Dependencies.has(Node.Reference)) {
      throw this.Diagnostics.UsedBeforeItsDeclaration(Node.Reference);
    }
    this.DetectCircularDependency(Node.Reference, Node);
    return this.SetNode(Node);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.NodeValues.has(Node.Reference)) return this.NodeValues.get(Node.Reference);
    throw this.Diagnostics.CantFindReference(Node.Reference);
  }

  SetValue(Reference: string, Value: number): number {
    this.NodeValues.set(Reference, Value);
    return Value;
  }

  Assign(Node: BoundCell, Value: number): Generator<BoundCell> {
    const State = this.GetNode(Node.Reference);
    Node.Dependents = State.Dependents;
    for (const Reference of State.Dependencies) {
      const Dependency = this.GetNode(Reference);
      Node.Dependencies.has(Reference) ? Dependency.Notify(Node) : Dependency.DoNoNotify(Node);
    }
    this.SetValue(Node.Reference, Value);
    return this.DetectForChange(Node, new Set<string>());
  }

  private DetectCircularDependency(Reference: string, Node: BoundCell): void {
    if (Node.Dependencies.has(Reference)) throw this.Diagnostics.CircularDependency(Reference, Node.Reference);
    for (const Dependency of Node.Dependencies) this.DetectCircularDependency(Reference, this.GetNode(Dependency));
  }

  private GetNode(Reference: string) {
    if (this.HasNode(Reference)) return this.Nodes.get(Reference);
    throw this.Diagnostics.CantFindReference(Reference);
  }

  private HasNode(Reference: string) {
    return this.Nodes.has(Reference);
  }

  private SetNode(Node: BoundCell) {
    if (!this.HasNode(Node.Reference)) this.Nodes.set(Node.Reference, Node);
    return Node;
  }

  private *DetectForChange(Node: BoundCell, ForChange: Set<string>): Generator<BoundCell> {
    for (const Reference of Node.Dependents) {
      if (ForChange.has(Reference)) continue;
      ForChange.add(Reference);
      const NextNode = this.GetNode(Reference);
      yield NextNode;
      yield* this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }

  Assert(Reference: string) {
    if (this.HasNode(Reference)) return;
    throw this.Diagnostics.CantFindReference(Reference);
  }

  Clear() {
    this.Nodes.clear();
    this.NodeValues.clear();
    this.Stack.clear();
  }
}
