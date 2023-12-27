import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { RgbColor } from "./Interpreter/RgbColor";

export class Cell {
  constructor(
    public Name: string,
    public Value: number,
    public Expression: BoundExpression,
    public Dependencies: Set<string>,
    public Dependents: Set<string>
  ) {}

  public Notify(Name: string): void {
    // if (!this.Dependencies.has(Name)) console.log(RgbColor.Teal(`${this.Name} ~~~ ${Name}`));
    this.Dependents.add(Name);
  }

  public DoNotNotify(Name: string): void {
    // if (this.Dependents.has(Name)) console.log(RgbColor.Teal(`${this.Name} ~/~ ${Name}`));
    this.Dependents.delete(Name);
  }
}
