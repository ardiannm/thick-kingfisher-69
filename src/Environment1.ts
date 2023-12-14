import { BoundExpression } from "./CodeAnalysis/Binding/BoundExpression";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "./CodeAnalysis/Diagnostics/DiagnosticKind";

export class Cell {
  constructor(public Name: string, public Value: number, public Expression: BoundExpression, public Dependencies: Set<string>, public Dependents: Set<string>) {}

  public Notify(Bound: Cell): void {
    this.Dependents.add(Bound.Name);
  }

  public DoNoNotify(Bound: Cell): void {
    this.Dependents.delete(Bound.Name);
  }
}

export class Environment1 {
  private Documents = new Map<string, Cell>();
  private Diagnostics: DiagnosticBag = new DiagnosticBag(DiagnosticKind.Environment);

  private Has(Name: string): boolean {
    return this.Documents.has(Name);
  }

  private Get(Name: string): Cell {
    if (this.Has(Name)) {
      return this.Documents.get(Name) as Cell;
    }
    throw this.Diagnostics.DocumentDoesNotExist(Name);
  }

  Assign(Name: string, Value: number, Expression: BoundExpression) {
    this.Documents.set(Name, new Cell(Name, Value, Expression, new Set<string>(), new Set<string>()));
  }

  GetValue(Name: string): number {
    try {
      return this.Get(Name).Value;
    } catch (error) {
      throw this.Diagnostics.HasNeverBeenAssigned(Name);
    }
  }

  private *DetectForChange(Node: Cell, ForChange: Set<string>): Generator<Cell> {
    for (const Name of Node.Dependents) {
      if (ForChange.has(Name)) continue;
      ForChange.add(Name);
      const NextNode = this.Get(Name);
      yield NextNode;
      yield* this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }
}
