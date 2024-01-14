import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
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
    public Observers: Map<string, Cell>
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

  CheckCircularity() {
    const Visited = new Set<string>();
    const HasCircularDependency = (Dependency: Cell): null | Cell => {
      if (Dependency.Subjects.has(this.Name)) {
        return Dependency;
      }
      for (const Subject of Dependency.Subjects.values()) {
        if (Visited.has(Subject.Name)) {
          continue;
        }
        const CircularSubject = HasCircularDependency(Subject);
        if (HasCircularDependency(Subject)) {
          return CircularSubject;
        }
      }
      return null;
    };
    const Check = HasCircularDependency(this);
    Visited.clear();
    return Check;
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
