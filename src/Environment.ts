import { BoundExpression } from "./CodeAnalysis/Binding/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";

export class Cell {
  constructor(public Kind: BoundKind, public Name: string, public Dependencies: Set<string>, public Dependents: Set<string>, public Expression: BoundExpression) {}

  Notify(Bound: Cell): void {
    this.Dependents.add(Bound.Name);
  }

  DoNoNotify(Bound: Cell): void {
    this.Dependents.delete(Bound.Name);
  }
}

export class Environment {
  private Expressions = new Map<string, Cell>();
  private Values = new Map<string, number>();
  private Diagnostics: DiagnosticBag = new DiagnosticBag();

  GetValue(Name: string): number {
    if (this.Values.has(Name)) return this.Values.get(Name) as number;
    throw this.Diagnostics.HasNeverBeenAssigned(Name);
  }

  Assign(Name: string, Expression: BoundExpression, Value: number) {}

  private *DetectForChange(Node: Cell, ForChange: Set<string>): Generator<Cell> {
    for (const Name of Node.Dependents) {
      if (ForChange.has(Name)) continue;
      ForChange.add(Name);
      const NextNode = this.Expressions.get(Name) as Cell;
      yield NextNode;
      yield* this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }
}
