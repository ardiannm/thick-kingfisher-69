import { CellNode } from './cell.ts'
import { ExpressionNode } from './expression.ts'

export class RangeNode extends ExpressionNode {
  public font: string

  constructor(public left: CellNode, public right: CellNode) {
    super()
    this.font = this.left.font + ':' + this.right.font
  }
}
