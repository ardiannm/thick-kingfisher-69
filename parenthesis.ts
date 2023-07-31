import { CloseParenthesis } from "./close.parenthesis.ts";
import { Expression } from "./expression.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";

export class Parenthesis extends Expression {
  constructor(public open: OpenParenthesis, public expression: Expression, public close: CloseParenthesis) {
    super();
  }
}
