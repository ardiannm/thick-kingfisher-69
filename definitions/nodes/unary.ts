import { ExpressionNode } from "./expression";

export class UnaryNode extends ExpressionNode {
  constructor(public operator: string, public right: ExpressionNode) {
    super();
  }
}
