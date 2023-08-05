import Expression from "./expression.ts";
import Operator from "./operator.ts";
import TokenInfo from "./token.info.ts";

export default class Unary extends Expression {
  constructor(public operator: Operator, public right: Expression, public info: TokenInfo) {
    super(info);
  }
}
