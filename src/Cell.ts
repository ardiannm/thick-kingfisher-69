import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";

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

  CircularDependency() {
    const Visited = new Set<string>();
    const HasCircularDependency = (Cell: Cell): null | Cell => {
      if (Cell.Subjects.has(this.Name)) {
        return Cell;
      }
      for (const Subject of Cell.Subjects.values()) {
        if (Visited.has(Subject.Name)) continue;
        const CircularSubject = HasCircularDependency(Subject);
        if (HasCircularDependency(Subject)) return CircularSubject;
      }
      return null;
    };

    const Check = HasCircularDependency(this);
    Visited.clear();
    return Check;
  }
}
