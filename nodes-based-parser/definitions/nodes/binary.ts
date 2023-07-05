import { ExpressionNode } from "./expression.ts";

export class BinaryNode extends ExpressionNode {
  constructor(public left: ExpressionNode, public operator: string, public right: ExpressionNode) {
    super();
  }
}
