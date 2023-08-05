import Expression from "./expression.ts";
import Operator from "./operator.ts";
import TokenInfo from "./token.info.ts";

export default class Binary extends Expression {
  constructor(public left: Expression, public operator: Operator, public right: Expression, public info: TokenInfo) {
    super(info);
  }
}
