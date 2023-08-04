import Expression from "./expression.ts";
import TokenInfo from "./token.info.ts";

export default class Program extends Expression {
  constructor(public expressions: Array<Expression>, public info: TokenInfo) {
    super(info);
  }
}
