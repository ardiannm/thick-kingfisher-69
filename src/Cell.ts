import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { Evaluator } from "./Evaluator";
import { RgbColor } from "./Text/RgbColor";

type Event = (Value: number) => void;

export class Cell extends BoundNode {
  private Subscriptions = new Set<Event>();

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

  Watch(Subject: Cell) {
    this.Subjects.set(Subject.Name, Subject);
    Subject.Notify(this);
  }

  Notify(Observer: Cell) {
    this.Observers.set(Observer.Name, Observer);
  }

  CircularCheck() {
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
    const Value = Class.EvaluateNode(this.Expression);
    if (Value === this.Value) {
      return Value;
    }
    this.SetValue(Value);
    this.Observers.forEach((Observer) => {
      Observer.Evaluate(Class);
      const Message = "'" + this.Name + "'  '" + Observer.Name + " -> " + Observer.Value + "'";
      console.log(RgbColor.Teal(Message));
    });
    return this.Value;
  }

  private ClearObserver(Observer: Cell) {
    this.Observers.delete(Observer.Name);
  }

  ClearSubjects() {
    this.Subjects.forEach((Subject) => Subject.ClearObserver(this));
    this.Subjects.clear();
  }

  SetValue(Value: number) {
    this.Value = Value;
    for (const Sub of this.Subscriptions) Sub(Value);
  }

  Subscribe(Fn: Event) {
    this.Subscriptions.add(Fn);
  }
}
