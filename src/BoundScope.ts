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
      const Data = new Cell(Name, 0, Expression, Dependencies, new Set<string>());
      this.Data.set(Name, Data);
      for (const Dep of Dependencies) this.GetCell(Dep).Notify(Name);
      return Data;
    }
    const Data = this.GetCell(Name);
    for (const Dep of Data.Dependencies) if (!Dependencies.has(Dep)) this.GetCell(Dep).DoNotNotify(Name);
    Data.Dependencies = Dependencies;
    for (const Dep of Data.Dependencies) this.GetCell(Dep).Notify(Name);
    return Data;
  }

  private *IterateDependencies(Node: Cell): Generator<Cell> {
    for (const Dep of Node.Dependencies) {
      const NextNode = this.GetCell(Dep);
      yield NextNode;
      yield* this.IterateDependencies(NextNode);
    }
  }

  private *IterateDependents(Node: Cell): Generator<Cell> {
    for (const Dep of Node.Dependents) {
      const NextNode = this.GetCell(Dep);
      yield NextNode;
      yield* this.IterateDependents(NextNode);
    }
  }

  HasCircularLogic(Node: Cell) {
    for (const NextNode of this.IterateDependencies(Node)) if (NextNode.Dependencies.has(Node.Name)) return NextNode;
    return undefined;
  }

  public *DetectForChanges(Node: Cell) {
    for (const PrevNode of this.IterateDependents(Node)) {
      if (PrevNode === Node) break;
      yield PrevNode;
    }
  }
}
