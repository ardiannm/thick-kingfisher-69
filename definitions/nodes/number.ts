import { ExpressionNode } from "./expression.ts";

export class NumberNode extends ExpressionNode {
  constructor(public font: string) {
    super();
  }
}
