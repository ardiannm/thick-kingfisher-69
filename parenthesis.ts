import CloseParenthesis from "./close.parenthesis.ts";
import Expression from "./expression.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import TokenInfo from "./token.info.ts";

export default class Parenthesis extends Expression {
  constructor(public open: OpenParenthesis, public expression: Expression, public close: CloseParenthesis, public info: TokenInfo) {
    super(info);
  }
}
