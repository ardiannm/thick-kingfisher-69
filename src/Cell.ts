import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";

export class Cell {
  constructor(
    public Name: string,
    public Value: number,
    public Expression: BoundExpression,
    public Dependencies: Set<string>,
    public Dependents: Set<string>
  ) {}

  public Notify(Name: string): void {
    this.Dependents.add(Name);
  }

  public DoNotNotify(Name: string): void {
    this.Dependents.delete(Name);
  }
}
