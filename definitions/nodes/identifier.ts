import { ExpressionNode } from "./expression.ts";

export class IdentifierNode extends ExpressionNode {
  constructor(public font: string) {
    super();
  }
}
