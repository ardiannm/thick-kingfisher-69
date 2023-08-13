import Lexer from "./lexer.ts";
import UnknownCharacter from "./unknown.character.ts";
import Binary from "./binary.ts";
import Operator from "./operator.ts";
import Expression from "./expression.ts";
import Multiplication from "./multiplication.ts";
import Division from "./division.ts";
import Unary from "./unary.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import Parenthesis from "./parenthesis.ts";
import Quote from "./quote.ts";
import String from "./string.ts";
import ParserError from "./parser.error.ts";
import WarningError from "./warning.error.ts";
import Substraction from "./substraction.ts";
import Addition from "./addition.ts";
import Exponentiation from "./exponentiation.ts";
import Identifier from "./identifier.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";
import Token from "./token.ts";
import Logger from "./logger.ts";
import LessThan from "./less.than.ts";
import Equals from "./equals.ts";
import OpenTag from "./open.tag.ts";
import Property from "./property.ts";
import ClosingTag from "./closing.tag.ts";
import GreaterThan from "./greater.than.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  public errors = new Array<Logger>();

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token>(token: Token, constructor: Constructor<T>, error: Logger): T {
    if (this.assert(token, constructor)) return token as T;
    this.errors.push(error);
    return token as T;
  }

  public reportError(error: Logger) {
    this.errors = [error, ...this.errors];
    return error;
  }

  public parse() {
    return this.parseProgram();
  }

  private parseProgram() {
    return this.parseOpenTag();
  }

  private parseOpenTag() {
    const open = this.getNextToken();
    const token = this.expect(open, LessThan, new ParserError("Execting an openning '<' to open tag", open.from, open.to));
    if (this.peekToken() instanceof Division) {
      return this.parseClosingTag();
    }
    const identifier = this.parseToken() as Identifier;
    this.expect(identifier, Identifier, new ParserError("Expecting identifier for an open tag", identifier.from, identifier.to));
    const props = this.parseProperties();
    this.expect(this.parseToken(), GreaterThan, new ParserError("Expecting a closing '>' for this tag", open.from, this.position));
    return new OpenTag(identifier, props, token.from, this.position);
  }

  private parseClosingTag() {
    const division = this.getNextToken();
    const identifier = this.parseToken() as Identifier;
    this.expect(identifier, Identifier, new ParserError("Expecting identifier for this closing tag", identifier.from, identifier.to));
    this.expect(this.parseToken(), GreaterThan, new ParserError("Expecting a closing '>' for this tag", division.from, this.position));
    return new ClosingTag(identifier, division.from, this.position);
  }

  private parseProperties() {
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let value = true as string | boolean;
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        value = this.expect(this.parseString(), String, new ParserError("Expecting value after '=' token following a tag property", identifier.from, this.position)).raw;
      }
      props.push(new Property(identifier.raw, value, identifier.from, this.position));
    }
    return props;
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, left.to, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, left.to, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, left.to, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError(`Invalid expression in unary ${operator.token} operation`, operator.to, this.position));
      return new Unary(operator, right, operator.from, right.to);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const left = this.parseToken();
      const expression = this.parseAddition();
      const right = this.parseToken();

      if (expression instanceof ClosingParenthesis) {
        this.expect(expression, Expression, new ParserError("No expression has been provided within parenthesis", left.from, this.position));
      } else {
        this.expect(right, ClosingParenthesis, new ParserError("Expecting a closing parenthesis", left.from, this.position));
      }

      return new Parenthesis(expression, left.from, right.to);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.keepSpace();
      const begin = this.parseToken() as Quote;
      let raw = "";
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) {
          this.reportError(new WarningError(`Unknown character '${token.raw}' found while parsing`, token.from, token.to));
        }
        if (token instanceof Quote) break;
        raw += this.getNextCharacter();
      }
      const end = this.expect(this.parseToken(), Quote, new ParserError("Expecing a closing quote for the string", this.position, this.position));
      this.ignoreSpace();
      return new String(raw, begin.to, end.from);
    }
    return this.parseToken();
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.reportError(new WarningError(`Unknown character '${token.raw}' found while parsing`, token.from, token.to));
    }
    return token;
  }
}
