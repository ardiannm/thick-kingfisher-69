import Lexer from "./lexer.ts";
import UnknownCharacter from "./unknown.character.ts";
import Binary from "./binary.ts";
import Operator from "./operator.ts";
import Expression from "./expression.ts";
import Multiplication from "./multiplication.ts";
import Division from "./division.ts";
import Unary from "./unary.ts";
import OpenParenthesis from "./open.parenthesis.ts";
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
import LessThan from "./less.than.ts";
import Equals from "./equals.ts";
import OpenTag from "./open.tag.ts";
import Property from "./property.ts";
import ClosingTag from "./closing.tag.ts";
import GreaterThan from "./greater.than.ts";
import UniTag from "./uni.tag.ts";
import Program from "./program.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<Class> = new (...args: any[]) => Class;

export default class Parser extends Lexer {
  protected errors = new Array<ParserError>();

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token, E extends ParserError>(token: Token, tokenConstructor: Constructor<T>, errorConstructor: Constructor<E>, message: string): T {
    if (this.assert(token, tokenConstructor)) return token as T;
    this.log(new errorConstructor(message, token) as E);
    return token as T;
  }

  protected log(error: ParserError) {
    this.errors.push(error);
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
    const left = this.expect(this.parseToken(), LessThan, ParserError, "Expecting a open '<' token");
    const tag = this.parseUniTag();
    const right = this.expect(this.parseToken(), GreaterThan, ParserError, "Expecting a closing '>' token");
    tag.from = left.from;
    tag.to = right.to;
    return tag;
  }

  private parseUniTag() {
    const left = this.parseOpenTag();
    if (this.peekToken() instanceof Division) {
      const right = this.expect(left, OpenTag, ParserError, "Unexpected token '/' found for this closing tag");
      this.parseToken();
      return new UniTag(left.identifier, right.properties, right.from, this.position);
    }
    return left;
  }

  private parseOpenTag() {
    if (this.peekToken() instanceof Division) {
      return this.parseClosingTag();
    }
    const identifier = this.expect(this.parseToken(), Identifier, ParserError, "Expecting identifier for an open tag");
    const properties = this.parseProperties();
    return new OpenTag(identifier, properties, identifier.from, this.position);
  }

  private parseClosingTag() {
    const division = this.expect(this.parseToken(), Division, ParserError, "Expecting '/' for a closing tag");
    const identifier = this.expect(this.parseToken(), Identifier, ParserError, "Expecting an identifier for this closing tag");
    return new ClosingTag(identifier, division.from, this.position);
  }

  private parseProperties() {
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let value = "";
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        value = this.expect(this.parseString(), String, ParserError, "Expecting a string value after an '=' token following a tag property").raw;
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
      this.expect(left, Expression, ParserError, `Invalid left hand side expression in ${this.peekToken().token} operation`);
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseMultiplication(), Expression, ParserError, `Invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, ParserError, `Invalid left hand side expression in ${operator.token} operation`);
      const right = this.expect(this.parsePower(), Expression, ParserError, `Invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, ParserError, `Invalid left hand side expression in ${operator.token} operation`);
      const right = this.expect(this.parsePower(), Expression, ParserError, `Invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, ParserError, `Invalid expression in unary ${operator.token} operation`);
      return new Unary(operator, right, this.position, right.to);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      const token = this.peekToken();
      if (token instanceof ClosingParenthesis) {
        this.log(new ParserError("No expression has been provided within parenthesis", this.getNextToken()));
      }
      const expression = this.parseAddition();
      const right = this.getNextToken();
      if (!(token instanceof ClosingParenthesis)) {
        this.expect(right, ClosingParenthesis, ParserError, "Expecting a closing parenthesis");
      }
      return expression;
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.keepSpace();
      const left = this.getNextToken() as Quote;
      let raw = "";
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) {
          this.log(new WarningError(`Unknown character '${token.raw}' found while parsing`, token));
        }
        if (token instanceof Quote) break;
        raw += this.getNext();
      }
      const right = this.expect(this.parseToken(), Quote, ParserError, "Expecting a closing quote for the string");
      this.ignoreSpace();
      return new String(raw, left.to, right.from);
    }
    return this.parseToken();
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.log(new WarningError(`Unknown character '${token.raw}' found while parsing`, token));
    }
    return token;
  }
}
