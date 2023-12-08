import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundReferenceDeclaration } from "./CodeAnalysis/Binding/BoundReferenceDeclaration";

// Environment class manages the state of the program's variables and handles change observations.

export class Environment {
  private Stack = new Set<string>();
  private ReferenceNodes = new Map<string, BoundReferenceDeclaration>();
  private NodeValue = new Map<string, number>();

  constructor(private Diagnostics: DiagnosticBag) {}

  ReferToCell(Bound: BoundCellReference) {
    this.Stack.add(Bound.Reference);
  }

  EatStack(): Array<string> {
    const Stack = Array.from(this.Stack);
    this.Stack.clear();
    return Stack;
  }

  DeclareNode(Bound: BoundReferenceDeclaration) {
    if (Bound.Referencing.includes(Bound.Reference)) {
      throw this.Diagnostics.UsedBeforeDeclaration(Bound.Reference);
    }
    this.CheckCircularRefs(Bound.Reference, Bound);
    if (!this.HasNode(Bound.Reference)) this.SetNode(Bound.Reference, Bound);
    return Bound;
  }

  private CheckCircularRefs(Reference: string, Bound: BoundReferenceDeclaration) {
    if (Bound.Referencing.includes(Reference)) throw this.Diagnostics.CircularDependency(Reference, Bound.Reference);
    for (const Node of Bound.Referencing) this.CheckCircularRefs(Reference, this.GetNode(Node));
  }

  private GetNode(r: string) {
    if (this.HasNode(r)) return this.ReferenceNodes.get(r);
    throw this.Diagnostics.CantFindReference(r);
  }

  private HasNode(r: string) {
    return this.ReferenceNodes.has(r);
  }

  private SetNode(r: string, Bound: BoundReferenceDeclaration) {
    this.ReferenceNodes.set(r, Bound);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.NodeValue.has(Node.Reference)) return this.NodeValue.get(Node.Reference);
    throw this.Diagnostics.UndeclaredVariable(Node.Reference);
  }

  SetValue(r: string, Value: number): number {
    this.NodeValue.set(r, Value);
    return Value;
  }

  Assign(Node: BoundReferenceDeclaration, Value: number) {
    const State = this.GetNode(Node.Reference);
    Node.ReferencedBy = State.ReferencedBy;
    for (const r of State.Referencing)
      if (Node.Referencing.includes(r)) this.GetNode(r).Subscribe(Node);
      else this.GetNode(r).Unsubscribe(Node);
    this.SetValue(Node.Reference, Value);
    return this.OnChange(Node);
  }
  //   A1->1; A2->A1; A3->A1+A2; A1->3; A2->4;
  private OnChange(Node: BoundReferenceDeclaration): Array<BoundReferenceDeclaration> {
    const ForChange = this.DetectForChange(Node, new Set<string>());
    console.log([Node.Reference], [...ForChange]);
    return [...ForChange].map((r) => this.GetNode(r));
  }

  private DetectForChange(Node: BoundReferenceDeclaration, ForChange: Set<string>) {
    for (const r of Node.ReferencedBy) {
      if (ForChange.has(r)) continue;
      ForChange.add(r);
      this.DetectForChange(this.GetNode(r), ForChange);
    }
    return ForChange;
  }
}
