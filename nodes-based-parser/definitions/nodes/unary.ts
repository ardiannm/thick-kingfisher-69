import { ExpressionNode } from "./expression.ts";

export class UnaryNode extends ExpressionNode {
  constructor(public operator: string, public right: ExpressionNode) {
    super();
  }
}
