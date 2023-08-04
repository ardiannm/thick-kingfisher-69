import Expression from "./expression.ts";
import TokenInfo from "./token.info.ts";

export default class Value extends Expression {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
