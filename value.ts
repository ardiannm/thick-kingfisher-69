import Expression from "./expression.ts";
import TokenInfo from "./token.info.ts";

export default class Value extends Expression {
  constructor(public string: string, public info: TokenInfo) {
    super(info);
  }
}
