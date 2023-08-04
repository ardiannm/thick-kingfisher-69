import ClosingParenthesis from "./closing.parenthesis.ts";
import Expression from "./expression.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import TokenInfo from "./token.info.ts";

export default class Parenthesis extends Expression {
  constructor(public openning: OpenParenthesis, public expression: Expression, public closing: ClosingParenthesis, public info: TokenInfo) {
    super(info);
  }
}
