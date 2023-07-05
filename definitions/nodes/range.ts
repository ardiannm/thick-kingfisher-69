import { CellNode } from './cell'
import { ExpressionNode } from './expression'

export class RangeNode extends ExpressionNode {
  public font: string

  constructor(public left: CellNode, public right: CellNode) {
    super()
    this.font = this.left.font + ':' + this.right.font
  }
}
