import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
// import { RgbColor } from "./Interpreter/RgbColor";

export class Cell {
  constructor(
    public Name: string,
    public Value: number,
    public Expression: BoundExpression,
    public Subjects: Set<string>,
    public Observers: Set<string>
  ) {}

  public Notify(Name: string): void {
    // if (!this.Dependencies.has(Name)) console.log(RgbColor.Teal(`${this.Name} ~~~ ${Name}`));
    this.Observers.add(Name);
  }

  public DoNotNotify(Name: string): void {
    // if (this.Dependents.has(Name)) console.log(RgbColor.Teal(`${this.Name} ~/~ ${Name}`));
    this.Observers.delete(Name);
  }
}
