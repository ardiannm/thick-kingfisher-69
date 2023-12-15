import { BoundExpression } from "./Binding/BoundExpression";
import { BoundKind } from "./Binding/BoundKind";
import { BoundNumber } from "./Binding/BoundNumber";
import { BoundReferenceStatement } from "./Binding/BoundReferenceStatement";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "./Diagnostics/DiagnosticKind";

export class Cell {
  constructor(public Name: string, public Value: number, public Expression: BoundExpression, public Dependencies: Set<string>, public Dependents: Set<string>) {}

  public Notify(Name: string): void {
    this.Dependents.add(Name);
  }

  public DoNotNotify(Name: string): void {
    this.Dependents.delete(Name);
  }
}

export class BoundScope {
  private Vars = new Map<string, Cell>();
  private Expression = new BoundNumber(BoundKind.Number, 0);
  private Diagnostics = new DiagnosticBag(DiagnosticKind.BoundScope);

  Names = new Set<string>();

  constructor(public Parent: BoundScope | undefined) {}

  public Push(Name: string) {
    this.Names.add(Name);
  }

  private ResolveScope(Name: string): BoundScope | undefined {
    if (this.Vars.has(Name)) {
      return this;
    }
    if (this.Parent) {
      return this.ResolveScope(Name);
    }
    return undefined;
  }

  public VarSet(Name: string, Dependencies: Set<string>): boolean {
    this.Detect(Name, Dependencies);
    const Scope = this.ResolveScope(Name) as BoundScope;
    if (Scope === undefined) {
      this.Vars.set(Name, new Cell(Name, this.Expression.Value, this.Expression, Dependencies, new Set<string>()));
      return true;
    }
    const Var = Scope.Vars.get(Name) as Cell;
    Var.Dependencies = Dependencies;
    return false;
  }

  public VarGet(Name: string): Cell {
    const Scope = this.ResolveScope(Name);
    if (Scope === undefined) {
      throw this.Diagnostics.NotFound(Name);
    }
    return Scope.Vars.get(Name) as Cell;
  }

  private Detect(Name: string, Dependencies: Set<string>) {
    if (Dependencies.has(Name)) {
      throw this.Diagnostics.UsedBeforeItsDeclaration(Name);
    }
    for (const Dep of Dependencies) {
      const Deps = this.VarGet(Dep).Dependencies;
      if (Deps.has(Name)) {
        throw this.Diagnostics.CircularDependency(Dep);
      }
      this.Detect(Name, Deps);
    }
  }

  public Assign(Node: BoundReferenceStatement, Value: number) {
    const Var = this.VarGet(Node.Name);

    Var.Dependencies.forEach((Dep) => this.VarGet(Dep).DoNotNotify(Var.Name));
    Node.Dependencies.forEach((Dep) => this.VarGet(Dep).Notify(Var.Name));

    Var.Expression = Node.Expression;
    Var.Dependencies = Node.Dependencies;
    Var.Value = Value;

    return this.DetectForChange(Var, new Set<string>());
  }

  private *DetectForChange(Node: Cell, ForChange: Set<string>): Generator<Cell> {
    for (const Dep of Node.Dependents) {
      if (ForChange.has(Dep)) continue;
      ForChange.add(Dep);
      const NextNode = this.VarGet(Dep);
      yield NextNode;
      this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }

  public Set(Name: string, Value: number) {
    this.VarGet(Name).Value = Value;
  }
}
