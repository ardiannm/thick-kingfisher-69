import { BoundExpression } from "./Binding/BoundExpression";
import { BoundKind } from "./Binding/BoundKind";
import { BoundNumber } from "./Binding/BoundNumber";

export class Cell {
  constructor(public Name: string, public Value: number, public Expression: BoundExpression, public Dependencies: Set<string>, public Dependents: Set<string>) {}

  public Notify(Bound: Cell): void {
    this.Dependents.add(Bound.Name);
  }

  public DoNoNotify(Bound: Cell): void {
    this.Dependents.delete(Bound.Name);
  }
}

export class BoundScope {
  constructor(public Parent?: BoundScope) {}

  private Expression = new BoundNumber(BoundKind.Number, 0);
  private Data = new Map<string, Cell>();

  public Names = new Set<string>();

  public Push(Name: string) {
    this.Names.add(Name);
  }

  public TryDeclare(Name: string, Dependencies: Set<string>): boolean {
    if (this.TryLookUp(Name)) {
      (this.Data.get(Name) as Cell).Dependencies = Dependencies;
      return false;
    }
    this.Data.set(Name, new Cell(Name, 0, this.Expression, Dependencies, new Set<string>()));
    return true;
  }

  public TryLookUp(Name: string): boolean {
    if (this.Data.has(Name)) {
      return true;
    }
    if (this.Parent) {
      return this.Parent.TryLookUp(Name);
    }
    return false;
  }
}
