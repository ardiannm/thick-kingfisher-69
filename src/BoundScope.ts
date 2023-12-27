import { Cell } from "./Cell";
import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";

export class BoundScope {
  private Data = new Map<string, Cell>();
  public readonly Names = new Set<string>();
  private Default = new Cell("", 0, new BoundNumber(BoundKind.Number, 0), new Set<string>(), new Set<string>());

  constructor(public ParentEnv?: BoundScope) {}

  public PushCell(Name: string) {
    this.Names.add(Name);
  }

  private ResolveScopeForCell(Name: string): BoundScope | undefined {
    if (this.Data.has(Name)) return this;
    if (this.ParentEnv) return this.ResolveScopeForCell(Name);
    return undefined;
  }

  DoesNotHave(Name: string): boolean {
    if (this.ResolveScopeForCell(Name)) return false;
    return true;
  }

  GetCell(Name: string): Cell {
    const Scope = this.ResolveScopeForCell(Name) as BoundScope;
    if (Scope === undefined) {
      this.Default.Name = Name;
      return this.Default;
    }
    return Scope.Data.get(Name) as Cell;
  }

  GetValue(Name: string) {
    return this.GetCell(Name).Value;
  }

  SetValueForCell(Name: any, Value: number) {
    this.GetCell(Name).Value = Value;
  }

  CreateCell(Name: string, Expression: BoundExpression, Dependencies: Set<string>) {
    if (this.DoesNotHave(Name)) {
      this.Data.set(Name, new Cell(Name, 0, Expression, Dependencies, new Set<string>()));
      for (const Dep of Dependencies) this.GetCell(Dep).Notify(Name);
      return true;
    }
    const Data = this.GetCell(Name);
    for (const Dep of Data.Dependencies) if (!Dependencies.has(Dep)) this.GetCell(Dep).DoNotNotify(Name);
    Data.Dependencies = Dependencies;
    for (const Dep of Data.Dependencies) this.GetCell(Dep).Notify(Name);
    return false;
  }

  public ContainsCircularLogic(Name: string) {
    if (this.Dependencies(Name, new Set<string>()).has(Name)) return true;
    return false;
  }

  private Dependencies(Name: string, Deps: Set<string>) {
    for (const Dep of this.GetCell(Name).Dependencies) {
      if (Deps.has(Dep)) continue;
      Deps.add(Dep);
      this.Dependencies(Dep, Deps);
    }
    return Deps;
  }
}
