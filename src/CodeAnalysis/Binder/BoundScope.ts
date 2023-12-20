import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundNumber } from "./BoundNumber";
import { BoundReferenceStatement } from "./BoundReferenceStatement";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { RgbColor } from "../Interpreter/RgbColor";

export class Cell {
  constructor(
    public Name: string,
    public Value: number,
    public Expression: BoundExpression,
    public Dependencies: Set<string>,
    public Dependents: Set<string>
  ) {}

  Notify(Name: string): void {
    this.Dependents.add(Name);
  }

  DoNotNotify(Name: string): void {
    this.Dependents.delete(Name);
  }
}

export class BoundScope {
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Environment);
  private Expression = new BoundNumber(BoundKind.Number, 0);

  private Data = new Map<string, Cell>();
  private ForChange = new Set<string>();

  Names = new Set<string>();

  constructor(public Parent?: BoundScope) {}

  PushCell(Name: string) {
    this.Names.add(Name);
  }

  private ResolveScopeForCell(Name: string): BoundScope | undefined {
    if (this.Data.has(Name)) {
      return this;
    }
    if (this.Parent) {
      return this.ResolveScopeForCell(Name);
    }
    return undefined;
  }

  TryDeclareCell(Name: string, Dependencies: Set<string>): boolean {
    this.DetectCircularDependencies(Name, Dependencies);
    const Scope = this.ResolveScopeForCell(Name) as BoundScope;
    if (Scope === undefined) {
      this.Data.set(Name, new Cell(Name, this.Expression.Value, this.Expression, Dependencies, new Set<string>()));
      return true;
    }
    const Data = Scope.Data.get(Name) as Cell;
    Data.Dependencies = Dependencies;
    return false;
  }

  TryLookUpCell(Name: string): Cell {
    const Scope = this.ResolveScopeForCell(Name);
    if (Scope === undefined) {
      throw this.Diagnostics.NameNotFound(Name);
    }
    return Scope.Data.get(Name) as Cell;
  }

  private DetectCircularDependencies(Name: string, Dependencies: Set<string>) {
    if (Dependencies.has(Name)) {
      throw this.Diagnostics.UsedBeforeItsDeclaration(Name);
    }
    for (const Dep of Dependencies) {
      const Deps = this.TryLookUpCell(Dep).Dependencies;
      if (Deps.has(Name)) {
        throw this.Diagnostics.CircularDependency(Dep);
      }
      this.DetectCircularDependencies(Name, Deps);
    }
  }

  Assign(Node: BoundReferenceStatement, Value: number) {
    const Data = this.TryLookUpCell(Node.Name);

    for (const Dep of Data.Dependencies) this.TryLookUpCell(Dep).DoNotNotify(Data.Name);
    for (const Dep of Node.Dependencies) this.TryLookUpCell(Dep).Notify(Data.Name);

    Data.Expression = Node.Expression;
    Data.Dependencies = Node.Dependencies;
    Data.Value = Value;

    return this.DetectAndNotifyForChange(Data);
  }

  private *DetectAndNotifyForChange(Node: Cell): Generator<Cell> {
    for (const Dep of Node.Dependents) {
      if (this.ForChange.has(Dep)) continue;
      this.ForChange.add(Dep);
      const NextNode = this.TryLookUpCell(Dep);
      yield NextNode;
      this.DetectAndNotifyForChange(NextNode);
    }
    this.ForChange.clear();
  }

  SetValueForCell(Name: string, Value: number) {
    const Data = this.TryLookUpCell(Name);

    const Diff = Value - Data.Value;
    var Text = Name + " -> " + Value;

    if (Diff !== 0) {
      Text += " (";
      if (Diff > 0) Text += "+";
      else if (Diff < 0) Text += "-";
      Text += Math.abs(Diff) + ")";
    }

    const View = RgbColor.Azure(Text);
    console.log(View);

    Data.Value = Value;
  }
}
