import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";
import { BoundDeclarationStatement } from "./CodeAnalysis/Binder/BoundDeclarationStatement";
import { RgbColor } from "./CodeAnalysis/Interpreter/RgbColor";
import { DiagnosticBag } from "./DiagnosticBag";
import { DiagnosticPhase } from "./DiagnosticPhase";
import { Cell } from "./Cell";

export class Environment {
  private Data = new Map<string, Cell>();
  private ForChange = new Set<string>();
  private Default = new Cell("", 0, new BoundNumber(BoundKind.Number, 0), new Set<string>(), new Set<string>());

  public readonly Names = new Set<string>();
  public readonly Diagnostics = new DiagnosticBag(DiagnosticPhase.Environment);

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

  public DeclareCell(Node: BoundDeclarationStatement) {
    this.ValidateCell(Node);
    const Env = this.ResolveEnvForCell(Node.Name) as Environment;
    if (Env === undefined) {
      const Value = this.Default.Value;
      const Expression = this.Default.Expression;
      const Data = new Cell(Node.Name, Value, Expression, Node.Dependencies, new Set<string>());
      this.Data.set(Node.Name, Data);
    } else {
      const Data = Env.Data.get(Node.Name) as Cell;
      for (const DepName of Data.Dependencies) {
        if (!Node.Dependencies.has(DepName)) this.GetCell(DepName).DoNotNotify(Node.Name);
      }
      Data.Dependencies = Node.Dependencies;
    }
  }

  public GetCell(Name: string): Cell {
    const Env = this.ResolveEnvForCell(Name);
    if (Env === undefined) {
      this.Diagnostics.ReportUndefinedCell(Name);
      this.Default.Name = Name;
      return this.Default;
    }
    return Env.Data.get(Name) as Cell;
  }

  private ValidateCell(Node: BoundDeclarationStatement) {
    if (Node.Dependencies.has(Node.Name)) {
      this.Diagnostics.ReportUsedBeforeItsDeclaration(Node.Name);
    }
    this.DetectCircularDependencies(Node.Name, Node.Dependencies);
  }

  private DetectCircularDependencies(Name: string, Dependencies: Set<string>) {
    for (const DepName of Dependencies) {
      const Deps = this.GetCell(DepName).Dependencies;
      if (Deps.has(Name)) {
        this.Diagnostics.ReportCircularDependency(DepName);
        return true;
      }
      if (this.DetectCircularDependencies(Name, Deps)) return true;
    }
    return false;
  }

  public Assign(Node: BoundDeclarationStatement, Value: number) {
    const Data = this.GetCell(Node.Name);
    for (const DepName of Data.Dependencies) {
      if (!Node.Dependencies.has(DepName)) this.GetCell(DepName).DoNotNotify(Data.Name);
    }
    Data.Dependencies = Node.Dependencies;
    for (const DepName of Data.Dependencies) {
      this.GetCell(DepName).Notify(Data.Name);
    }
    Data.Expression = Node.Expression;
    Data.Value = Value;
    return this.DetectAndNotifyForChange(Data);
  }

  private *DetectAndNotifyForChange(Node: Cell): Generator<Cell> {
    for (const Dep of Node.Dependents) {
      if (this.ForChange.has(Dep)) continue;
      this.ForChange.add(Dep);
      const NextNode = this.GetCell(Dep);
      yield NextNode;
      this.DetectAndNotifyForChange(NextNode);
    }
    this.ForChange.clear();
  }

  public SetValueForCell(Name: string, Value: number) {
    const Data = this.GetCell(Name);

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
}
