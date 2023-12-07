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
    this.CheckCircularRefs(Bound.Reference, Bound.Referencing);
    for (const Node of Bound.Referencing) {
      this.GetNode(Node).Subscribe(Bound);
    }
    if (!this.HasNode(Bound.Reference)) {
      this.SetNode(Bound.Reference, Bound);
    }
    return Bound;
  }

  private CheckCircularRefs(Reference: string, Referencing: Array<string>) {
    if (Referencing.includes(Reference)) {
      throw this.Diagnostics.CircularDependency(Reference);
    }
    Referencing.forEach((Node) => this.CheckCircularRefs(Reference, this.GetNode(Node).Referencing));
  }

  private GetNode(Node: string) {
    if (this.HasNode(Node)) return this.ReferenceNodes.get(Node);
    throw this.Diagnostics.CantFindReference(Node);
  }

  private HasNode(Node: string) {
    return this.ReferenceNodes.has(Node);
  }

  private SetNode(Node: string, Bound: BoundReferenceDeclaration) {
    this.ReferenceNodes.set(Node, Bound);
  }

  GetValue(Node: BoundCellReference): number {
    if (this.NodeValue.has(Node.Reference)) return this.NodeValue.get(Node.Reference);
    throw this.Diagnostics.UndeclaredVariable(Node.Reference);
  }
}
