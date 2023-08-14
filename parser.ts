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
import UniTag from "./uni.tag.ts";
import Program from "./program.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  protected errors = new Array<Logger>();

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token>(error: Logger, token: Token, constructor: Constructor<T>): T {
    if (this.assert(token, constructor)) return token as T;
    this.errors.push(error);
    return token as T;
  }

  protected log(error: Logger) {
    this.errors = [error, ...this.errors];
    return error;
  }

  public parse() {
    return this.parseProgram();
  }

  private parseProgram() {
    const expressions = new Array<Expression>(this.parseHTML());
    while (this.hasMoreTokens()) {
      expressions.push(this.parseHTML());
    }
    return new Program(expressions, 0, this.input.length);
  }

  private parseHTML() {
    if (this.peekToken() instanceof LessThan) {
      return this.parseTag();
    }
    return this.parseMath();
  }

  private parseTag() {
    const beginning = this.expect(new ParserError("Expecting a open '<' token", this.position), this.parseToken(), LessThan);
    const tag = this.parseUniTag();
    const ending = this.expect(new ParserError("Expecting a closing '>' token", this.position), this.parseToken(), GreaterThan);
    tag.from = beginning.from;
    tag.to = ending.to;
    return tag;
  }

  private parseUniTag() {
    const left = this.parseOpenTag();
    if (this.peekToken() instanceof Division) {
      const open = this.expect(new ParserError("Unexpected token '/' found for this closing tag", this.position), left, OpenTag);
      this.parseToken();
      return new UniTag(left.identifier, open.properties, open.from, this.position);
    }
    return left;
  }

  private parseOpenTag() {
    if (this.peekToken() instanceof Division) {
      return this.parseClosingTag();
    }
    const identifier = this.expect(new ParserError("Expecting identifier for an open tag", this.position), this.parseToken(), Identifier);
    const props = this.parseProperties();
    return new OpenTag(identifier, props, identifier.from, this.position);
  }

  private parseClosingTag() {
    const division = this.parseToken();
    const identifier = this.expect(new ParserError("Expecting an identifier for this closing tag", this.position), this.parseToken(), Identifier);
    return new ClosingTag(identifier, division.from, this.position);
  }

  private parseProperties() {
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let value = "";
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        value = this.expect(new ParserError("Expecting a string value after an '=' token following a tag property", this.position), this.parseString(), String).raw;
      }
      props.push(new Property(identifier, value, identifier.from, this.position));
    }
    return props;
  }

  private parseMath() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      this.expect(new ParserError(`Invalid left hand side expression in ${this.peekToken().token} operation`, this.position), left, Expression);
      const operator = this.parseToken() as Operator;
      const right = this.expect(new ParserError(`Invalid right hand side expression in ${operator.token} operation`, this.position), this.parseMultiplication(), Expression);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.parseToken() as Operator;
      this.expect(new ParserError(`Invalid left hand side expression in ${operator.token} operation`, this.position), left, Expression);
      const right = this.expect(new ParserError(`Invalid right hand side expression in ${operator.token} operation`, left.to), this.parsePower(), Expression);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.parseToken() as Operator;
      this.expect(new ParserError(`Invalid left hand side expression in ${operator.token} operation`, this.position), left, Expression);
      const right = this.expect(new ParserError(`Invalid right hand side expression in ${operator.token} operation`, left.to), this.parsePower(), Expression);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      const right = this.expect(new ParserError(`Invalid expression in unary ${operator.token} operation`, this.position), this.parseUnary(), Expression);
      return new Unary(operator, right, this.position, right.to);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const left = this.parseToken();
      const expression = this.expect(new ParserError("No expression has been provided within parenthesis", this.position), this.parseAddition(), Expression);
      const right = this.expect(new ParserError("Expecting a closing parenthesis", this.position), this.parseToken(), ClosingParenthesis);
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
          this.log(new WarningError(`Unknown character '${token.raw}' found while parsing`, this.position));
        }
        if (token instanceof Quote) break;
        raw += this.getNext();
      }
      const end = this.expect(new ParserError("Expecing a closing quote for the string", this.position), this.parseToken(), Quote);
      this.ignoreSpace();
      return new String(raw, begin.to, end.from);
    }
    return this.parseToken();
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.log(new WarningError(`Unknown character '${token.raw}' found while parsing`, this.position));
    }
    return token;
  }
}
