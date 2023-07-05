import { ExpressionNode } from "./expression";

export class IdentifierNode extends ExpressionNode {
  constructor(public font: string) {
    super();
  }
}
