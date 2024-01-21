import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { Evaluator } from "./Evaluator";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

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

  IsCircular(Subject: Cell, Diagnostics: DiagnosticBag) {
    if (this.Subjects.has(Subject.Name)) {
      Diagnostics.CircularDependency(Subject.Name, Subject.Name);
      return true;
    }
    for (const Sub of this.Subjects.values()) {
      if (Sub.IsCircular(Sub, Diagnostics)) continue;
      if (Sub.Subjects.has(Subject.Name)) {
        Diagnostics.CircularDependency(Subject.Name, Sub.Name);
        return true;
      }
      if (Sub.IsCircular(Subject, Diagnostics)) return true;
    }
    return false;
  }

  Evaluate(Class: Evaluator) {
    this.Value = Class.Evaluate(this.Expression);
    this.Observers.forEach((Observer) => Observer.Evaluate(Class));
    return this.Value;
  }

  private ClearObserver(Observer: Cell) {
    this.Observers.delete(Observer.Name);
  }

  ClearSubjects() {
    this.Subjects.forEach((Subject) => Subject.ClearObserver(this));
    this.Subjects.clear();
  }
}
