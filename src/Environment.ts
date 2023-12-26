import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";
import { BoundDeclarationStatement } from "./CodeAnalysis/Binder/BoundDeclarationStatement";
import { RgbColor } from "./CodeAnalysis/Interpreter/RgbColor";
import { DiagnosticBag } from "./DiagnosticBag";
import { DiagnosticPhase } from "./DiagnosticPhase";

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

export class Environment {
  private Expression = new BoundNumber(BoundKind.Number, 0);
  private Data = new Map<string, Cell>();
  private ForChange = new Set<string>();

  Names = new Set<string>();
  Diagnostics = new DiagnosticBag(DiagnosticPhase.Environment);

  constructor(public ParentEnv?: Environment) {}

  PushCell(Name: string) {
    this.Names.add(Name);
  }

  private ResolveEnvForCell(Name: string): Environment | undefined {
    if (this.Data.has(Name)) {
      return this;
    }
    if (this.ParentEnv) {
      return this.ResolveEnvForCell(Name);
    }
    return undefined;
  }

  TryDeclareCell(Node: BoundDeclarationStatement): boolean {
    this.Validate(Node);
    const Env = this.ResolveEnvForCell(Node.Name) as Environment;
    if (Env === undefined) {
      const Data = new Cell(Node.Name, this.Expression.Value, this.Expression, Node.Dependencies, new Set<string>());
      this.Data.set(Node.Name, Data);
      return true;
    }
    const Data = Env.Data.get(Node.Name) as Cell;
    for (const Dep of Data.Dependencies) if (!Node.Dependencies.has(Dep)) this.TryGetCell(Dep).DoNotNotify(Node.Name);
    Data.Dependencies = Node.Dependencies;
    return false;
  }

  TryGetCell(Name: string): Cell {
    const Env = this.ResolveEnvForCell(Name);
    if (Env === undefined) {
      throw this.Diagnostics.ReportNameNotFound(Name);
    }
    return Env.Data.get(Name) as Cell;
  }

  private Validate(Node: BoundDeclarationStatement) {
    if (Node.Dependencies.has(Node.Name)) {
      throw this.Diagnostics.ReportUsedBeforeItsDeclaration(Node.Name);
    }
    this.DetectCircularDependencies(Node.Name, Node.Dependencies);
  }

  private DetectCircularDependencies(Name: string, Dependencies: Set<string>) {
    for (const Dep of Dependencies) {
      const Deps = this.TryGetCell(Dep).Dependencies;
      if (Deps.has(Name)) {
        this.Diagnostics.ReportCircularDependency(Dep);
        return true;
      }
      if (this.DetectCircularDependencies(Name, Deps)) return true;
    }
    return false;
  }

  Assign(Node: BoundDeclarationStatement, Value: number) {
    const Data = this.TryGetCell(Node.Name);
    for (const Dep of Data.Dependencies) if (!Node.Dependencies.has(Dep)) this.TryGetCell(Dep).DoNotNotify(Data.Name);
    Data.Dependencies = Node.Dependencies;
    for (const Dep of Data.Dependencies) this.TryGetCell(Dep).Notify(Data.Name);
    Data.Expression = Node.Expression;
    Data.Value = Value;
    return this.DetectAndNotifyForChange(Data);
  }

  private *DetectAndNotifyForChange(Node: Cell): Generator<Cell> {
    for (const Dep of Node.Dependents) {
      if (this.ForChange.has(Dep)) continue;
      this.ForChange.add(Dep);
      const NextNode = this.TryGetCell(Dep);
      yield NextNode;
      this.DetectAndNotifyForChange(NextNode);
    }
    this.ForChange.clear();
  }

  SetValueForCell(Name: string, Value: number) {
    const Data = this.TryGetCell(Name);

    const Diff = Value - Data.Value;
    var Text = Name + " -> " + Value;

    if (Diff !== 0) {
      Text += " (";
      if (Diff > 0) Text += "+";
      else if (Diff < 0) Text += "-";
      Text += Math.abs(Diff) + ")";
    }

    const View = RgbColor.Moss(Text);
    console.log(View);

    Data.Value = Value;
  }

  FactoryReset() {
    this.Data.clear();
  }
}
