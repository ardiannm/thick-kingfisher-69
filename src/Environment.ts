import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceDeclaration } from "./CodeAnalysis/Binding/BoundReferenceDeclaration";

// Environment class manages the state of the program's variables and handles change observations.

export class Environment {
  private Nodes = new Map<string, BoundReferenceDeclaration>();
  private NodeValue = new Map<string, number>();

  Stack = new Set<string>();
  constructor(private Diagnostics: DiagnosticBag) {}

  ReferToCell(Bound: BoundCellReference): void {
    this.Stack.add(Bound.Reference);
  }

  Declare(Bound: BoundReferenceDeclaration): BoundReferenceDeclaration {
    if (Bound.Referencing.has(Bound.Reference)) {
      throw this.Diagnostics.UsedBeforeDeclaration(Bound.Reference);
    }
    this.DetectCircularDependency(Bound.Reference, Bound);
    return this.SetNode(Bound);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.NodeValue.has(Node.Reference)) return this.NodeValue.get(Node.Reference);
    throw this.Diagnostics.UndeclaredVariable(Node.Reference);
  }

  SetValue(Reference: string, Value: number): number {
    this.NodeValue.set(Reference, Value);
    return Value;
  }

  Assign(Node: BoundReferenceDeclaration, Value: number): Generator<BoundReferenceDeclaration> {
    const State = this.GetNode(Node.Reference);
    Node.ReferencedBy = State.ReferencedBy;
    for (const Reference of State.Referencing) {
      const Subject = this.GetNode(Reference);
      Node.Referencing.has(Reference) ? Subject.Observe(Node) : Subject.DoNotObserve(Node);
    }
    this.SetValue(Node.Reference, Value);
    return this.DetectForChange(Node, new Set<string>());
  }

  private DetectCircularDependency(Reference: string, Bound: BoundReferenceDeclaration): void {
    if (Bound.Referencing.has(Reference)) throw this.Diagnostics.CircularDependency(Reference, Bound.Reference);
    for (const Node of Bound.Referencing) this.DetectCircularDependency(Reference, this.GetNode(Node));
  }

  private GetNode(Reference: string) {
    if (this.HasNode(Reference)) return this.Nodes.get(Reference);
    throw this.Diagnostics.CantFindReference(Reference);
  }

  private HasNode(Reference: string) {
    return this.Nodes.has(Reference);
  }

  private SetNode(Bound: BoundReferenceDeclaration) {
    if (!this.HasNode(Bound.Reference)) this.Nodes.set(Bound.Reference, Bound);
    return Bound;
  }

  private *DetectForChange(Node: BoundReferenceDeclaration, ForChange: Set<string>): Generator<BoundReferenceDeclaration> {
    for (const Reference of Node.ReferencedBy) {
      if (ForChange.has(Reference)) continue;
      ForChange.add(Reference);
      const NextNode = this.GetNode(Reference);
      yield NextNode;
      yield* this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }
}
