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
  constructor(public Parent: BoundScope | undefined) {}

  private Expression = new BoundNumber(BoundKind.Number, 0);
  private Data = new Map<string, Cell>();

  public Names = new Set<string>();

  public Push(Name: string) {
    this.Names.add(Name);
  }

  private ResolveScope(Name: string): BoundScope | undefined {
    if (this.Data.has(Name)) {
      return this;
    }
    if (this.Parent) {
      return this.ResolveScope(Name);
    }
    return undefined;
  }

  public TryDeclare(Name: string, Dependencies: Set<string>): boolean {
    const Scope = this.ResolveScope(Name) as BoundScope;
    if (Scope === undefined) {
      this.Data.set(Name, new Cell(Name, this.Expression.Value, this.Expression, Dependencies, new Set<string>()));
      return true;
    }
    const Data = Scope.Data.get(Name) as Cell;
    Data.Dependencies = Dependencies;
    return false;
  }
}
