import { BoundExpression } from "./CodeAnalysis/Binder/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { RgbColor } from "./Text/RgbColor";

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

  public Notify(Cell: Cell): void {
    if (!this.Subjects.has(Cell.Name)) console.log(RgbColor.Azure(`${this.Name} ~~~ ${Cell.Name}`));
    this.Observers.set(Cell.Name, Cell);
  }

  public DoNotNotify(Cell: Cell): void {
    if (this.Observers.has(Cell.Name)) console.log(RgbColor.Azure(`${this.Name} ~/~ ${Cell.Name}`));
    this.Observers.delete(Cell.Name);
  }
}
