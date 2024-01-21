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

  IsCircular(Diagnostics: DiagnosticBag) {
    const Visited = new Set<string>();
    const HasCircularDependency = (Dependency: Cell): null | Cell => {
      if (Dependency.Subjects.has(this.Name)) {
        return Dependency;
      }
      for (const Subject of Dependency.Subjects.values()) {
        const Circular = Subject.IsCircular(Diagnostics);
        if (Circular) {
          Diagnostics.InvalidSubjectState(Circular.Name);
          continue;
        }
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
