import { CloseParenthesis } from "./close.parenthesis.ts";
import { Expression } from "./language.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Token } from "./token.ts";

export class Parenthesis extends Token {
  constructor(public begin: OpenParenthesis, public string: Expression, public end: CloseParenthesis) {
    super();
  }
}
