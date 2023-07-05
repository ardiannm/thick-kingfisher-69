import { ExpressionNode } from "./expression";

export class BinaryNode extends ExpressionNode {
  constructor(public left: ExpressionNode, public operator: string, public right: ExpressionNode) {
    super();
  }
}
