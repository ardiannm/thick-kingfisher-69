import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { Evaluator } from "./Evaluator";

export class Cell extends BoundNode {
  constructor(
    public override Kind: BoundKind.Cell,
    public Name: string,
    public Declared: boolean,
    public Value: number,
    public Expression: BoundExpression,
    public Subjects: Map<string, Cell>,
    public Observers: Map<string, Cell>,
    public Formula: string
  ) {
    super(Kind);
  }

  Watch(Subject: Cell) {
    this.Subjects.set(Subject.Name, Subject);
    Subject.Notify(this);
  }

  Notify(Observer: Cell) {
    this.Observers.set(Observer.Name, Observer);
  }

  Evaluate(Class: Evaluator) {
    this.Value = Class.Evaluate(this.Expression);
    this.Observers.forEach((Observer) => Observer.Evaluate(Class));
    return this.Value;
  }

  private ClearObserver(Observer: Cell) {
    this.Observers.delete(Observer.Name);
  }

  Contains(Subject: Cell, CheckingCells: Set<Cell> = new Set()): null | Cell {
    if (CheckingCells.has(this)) {
      // if the current cell is already in the set, it means a circular reference is detected.
      // in this case, return a reference to the current cell. This indicates the presence of a circular dependency.
      return this;
    }
    if (this.Subjects.has(Subject.Name)) {
      // check if the current cell directly contains the subject cell.
      // if it does, return a reference to the current cell.
      return this;
    }
    // add the current cell to the set indicating that the cell is being checked
    CheckingCells.add(this);
    // iterate over each subject cell.
    for (const Sub of this.Subjects.values()) {
      // for each subject cell, recursively call Contains on that cell, passing the set.
      const Result = Sub.Contains(Subject, CheckingCells);
      // if a non-null result is obtained from the recursive call, it means the subject cell is contained in the current cell's hierarchy.
      if (Result !== null) {
        // return that result immediately.
        CheckingCells.delete(this);
        return Result;
      }
    }
    // after checking all subjects, remove the current cell from the set
    CheckingCells.delete(this);
    return null;
  }

  ClearSubjects() {
    this.Subjects.forEach((Subject) => Subject.ClearObserver(this));
    this.Subjects.clear();
  }
}
