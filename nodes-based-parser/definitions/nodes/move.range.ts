import { ExpressionNode } from "./expression.ts";

export class MoveNode extends ExpressionNode {
  constructor(public left: ExpressionNode, public operator: string, public right: ExpressionNode) {
    super();
  }
}
