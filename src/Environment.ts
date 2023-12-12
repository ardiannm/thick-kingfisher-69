import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundCell } from "./CodeAnalysis/Binding/BoundCell";

export class Environment {
  private Nodes = new Map<string, BoundCell>();
  private NodeValues = new Map<string, number>();
  private Diagnostics: DiagnosticBag = new DiagnosticBag();

  Stack = new Set<string>();

  GetValue(Node: BoundCellReference): number {
    if (this.NodeValues.has(Node.Name)) return this.NodeValues.get(Node.Name) as number;
    throw this.Diagnostics.CantFindName(Node.Name);
  }

  SetValue(Reference: string, Value: number): number {
    this.NodeValues.set(Reference, Value);
    return Value;
  }

  Assign(Node: BoundCell, Value: number): Generator<BoundCell> {
    const State = this.GetNode(Node.Name);
    Node.Dependents = State.Dependents;
    for (const Reference of State.Dependencies) {
      const Dependency = this.GetNode(Reference);
      Node.Dependencies.has(Reference) ? Dependency.Notify(Node) : Dependency.DoNoNotify(Node);
    }
    this.SetValue(Node.Name, Value);
    return this.DetectForChange(Node, new Set<string>());
  }

  private GetNode(Reference: string): BoundCell {
    if (this.HasNode(Reference)) return this.Nodes.get(Reference) as BoundCell;
    throw this.Diagnostics.CantFindName(Reference);
  }

  private HasNode(Reference: string) {
    return this.Nodes.has(Reference);
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

  Clear() {
    this.Nodes.clear();
    this.NodeValues.clear();
    this.Stack.clear();
  }
}
