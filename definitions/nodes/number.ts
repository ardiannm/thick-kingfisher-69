import { ExpressionNode } from "./expression";

export class NumberNode extends ExpressionNode {
  constructor(public font: string) {
    super();
  }
}
