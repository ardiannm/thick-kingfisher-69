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

  Contains(Subject: Cell) {
    if (this.Observers.has(this.Name)) {
      return this;
    }
    if (this.Subjects.has(Subject.Name)) {
      return this;
    }
    for (const Sub of this.Subjects.values()) if (Sub.Contains(Subject)) return Sub;
    return null;
  }

  ClearSubjects() {
    this.Subjects.forEach((Subject) => Subject.ClearObserver(this));
    this.Subjects.clear();
  }
}
