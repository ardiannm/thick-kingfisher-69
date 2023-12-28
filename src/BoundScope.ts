import { Cell } from "./Cell";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { DiagnosticBag } from "./DiagnosticBag";
import { DiagnosticPhase } from "./DiagnosticPhase";
import { RgbColor } from "./Interpreter/RgbColor";

export class BoundScope {
  private Data = new Map<string, Cell>();
  public readonly Names = new Set<string>();

  constructor(public Diagnostics: DiagnosticBag, public ParentEnv?: BoundScope) {}

  public RegisterCell(Name: string) {
    this.Names.add(Name);
  }

  private ResolveScopeForCell(Name: string): BoundScope | undefined {
    if (this.Data.has(Name)) return this;
    if (this.ParentEnv) return this.ResolveScopeForCell(Name);
    return undefined;
  }

  public Assert(Name: string) {
    const Data = this.GetCell(Name);
    if (Data) return Data;
    this.Diagnostics.ReportUndefinedCell(DiagnosticPhase.Binder, Name);
    return undefined;
  }

  private GetCell(Name: string) {
    const Env = this.ResolveScopeForCell(Name);
    if (Env) return Env.Data.get(Name) as Cell;
    return undefined;
  }

  public SetValueForCell(Name: string, Value: number) {
    const Data = this.GetCell(Name);
    if (Data) {
      const Diff = Value - Data.Value;
      var Text = Name + " -> " + Value;
      if (Diff !== 0) {
        Text += " (";
        if (Diff > 0) Text += "+";
        else if (Diff < 0) Text += "-";
        Text += Math.abs(Diff) + ")";
      }
      const View = RgbColor.Teal(Text);
      console.log(View);
      Data.Value = Value;
    }
  }

  public DefineCell(Node: BoundCellAssignment) {
    for (const Dep of Node.Dependencies) {
      this.Assert(Dep);
    }
    const Data = this.GetCell(Node.Name);
    if (Data === undefined) {
      const Data = new Cell(Node.Name, 0, Node.Expression, Node.Dependencies, new Set<string>());
      this.Data.set(Node.Name, Data);
      for (const Dep of Data.Dependencies) this.GetCell(Dep)?.Notify(Node.Name);
      this.CheckDependency(Data);
      return Data;
    }
    for (const Dep of Data.Dependencies) this.GetCell(Dep)?.DoNotNotify(Node.Name);
    Data.Dependencies = Node.Dependencies;
    for (const Dep of Data.Dependencies) this.GetCell(Dep)?.Notify(Node.Name);
    Data.Dependencies = Node.Dependencies;
    this.CheckDependency(Data);
    return Data;
  }

  CheckDependency(Data: Cell) {
    const Deps = new Set<string>();
    for (const Dep of this.Dependency(Data)) {
      Deps.add(Dep);
      if (Deps.has(Data.Name)) {
        this.Diagnostics.ReportCircularDependency(DiagnosticPhase.Binder, Data.Name, Dep);
        break;
      }
    }
    console.log([Data.Name], [...Deps]);
  }

  *Dependency(Node: Cell): Generator<string> {
    for (const Dep of Node.Dependencies) {
      const NextNode = this.GetCell(Dep);
      if (NextNode) {
        yield NextNode.Name;
        yield* this.Dependency(NextNode);
      }
    }
  }
}
