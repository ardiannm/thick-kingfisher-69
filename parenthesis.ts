import { CloseParenthesis } from "./close.parenthesis.ts";
import { Expression } from "./language.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Token } from "./token.ts";

export class Parenthesis extends Token {
  constructor(public open: OpenParenthesis, public expression: Expression, public close: CloseParenthesis) {
    super();
  }
}
