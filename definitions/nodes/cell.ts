import { ExpressionNode } from './expression'

export class CellNode extends ExpressionNode {
  public font: string
  constructor(public row: string, public column: string) {
    super()
    this.font = this.column + this.row
  }
}
