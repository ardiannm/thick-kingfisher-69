import { BoundExpression } from "./Binding/BoundExpression";
import { BoundKind } from "./Binding/BoundKind";
import { BoundNumber } from "./Binding/BoundNumber";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "./Diagnostics/DiagnosticKind";

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
  private Data = new Map<string, Cell>();
  private Expression = new BoundNumber(BoundKind.Number, 0);
  private Diagnostics = new DiagnosticBag(DiagnosticKind.BoundScope);

  Names = new Set<string>();

  constructor(public Parent: BoundScope | undefined) {}

  Push(Name: string) {
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

  TryDeclare(Name: string, Dependencies: Set<string>): boolean {
    this.Detect(Name, Dependencies);
    const Scope = this.ResolveScope(Name) as BoundScope;
    if (Scope === undefined) {
      this.Data.set(Name, new Cell(Name, this.Expression.Value, this.Expression, Dependencies, new Set<string>()));
      return true;
    }
    const Data = Scope.Data.get(Name) as Cell;
    Data.Dependencies = Dependencies;
    return false;
  }

  private TryLookUp(Name: string): Cell {
    const Scope = this.ResolveScope(Name);
    if (Scope === undefined) {
      throw this.Diagnostics.NotFound(Name);
    }
    return Scope.Data.get(Name) as Cell;
  }

  private Detect(Name: string, Dependencies: Set<string>) {
    if (Dependencies.has(Name)) {
      throw this.Diagnostics.UsedBeforeItsDeclaration(Name);
    }
    for (const Dep of Dependencies) {
      const Deps = this.TryLookUp(Dep).Dependencies;
      if (Deps.has(Name)) {
        throw this.Diagnostics.CircularDependency(Dep);
      }
      this.Detect(Name, Deps);
    }
  }
}
