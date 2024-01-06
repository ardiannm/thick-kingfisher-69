import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class Cell extends BoundNode {
  constructor(
    public override Kind: BoundKind.Cell,
    public Name: string = "",
    public Declared = false,
    public Value: number = 0,
    public Expression: BoundExpression = new BoundNumericLiteral(BoundKind.NumericLiteral, 0),
    public Subjects = new Map<string, Cell>(),
    public Observers = new Map<string, Cell>()
  ) {
    super(Kind);
  }

  NotifyCell(Cell: Cell) {
    if (!this.Observers.has(Cell.Name)) {
      this.Observers.set(Cell.Name, Cell);
    }
    return this.Observers.get(Cell.Name) as Cell;
  }

  ObserveCell(Cell: Cell) {
    if (!this.Subjects.has(Cell.Name)) {
      this.Subjects.set(Cell.Name, Cell);
    }
    Cell.NotifyCell(this);
    return this.Subjects.get(Cell.Name) as Cell;
  }

  CircularDependency(Name: string, Diagnostics: DiagnosticBag) {
    const Visited = new Set<string>();

    const HasCircularDependency = (Cell: Cell) => {
      for (const Subject of Cell.Subjects.values()) {
        if (Visited.has(Subject.Name)) continue;
        Visited.add(Subject.Name);
        if (Subject.Name === Name) {
          Diagnostics.ReportCircularDependency(Name, Subject.Name);
          return true;
        }
        if (HasCircularDependency(Subject)) return true;
      }
      return false;
    };

    const Check = HasCircularDependency(this);
    Visited.clear();
    if (Check) {
      return true;
    }
    return false;
  }
}
