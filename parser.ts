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
import LessThan from "./less.than.ts";
import Identifier from "./identifier.ts";
import GreaterThan from "./greater.than.ts";
import Properties from "./properties.ts";
import UnaryTag from "./unary.tag.ts";
import ClosingTag from "./closing.tag.ts";
import OpenTag from "./open.tag.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";
import Token from "./token.ts";
import PlainText from "./plain.text.ts";
import HTML from "./html.ts";
import Component from "./component.ts";
import Program from "./program.ts";
import Number from "./number.ts";
import Tag from "./tag.ts";
import Logger from "./logger.ts";

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

  public report(error: Logger) {
    this.errors = [error, ...this.errors];
    return error;
  }

  public parse() {
    return this.parseProgram();
  }

  private parseProgram() {
    const expressions = new Array<Expression>(this.parseExpressions());
    while (this.hasMoreTokens()) {
      expressions.push(this.parseExpressions());
    }
    return new Program(expressions, 0, this.input.length);
  }

  private parseExpressions() {
    if (this.peekToken() instanceof LessThan) return this.parseComponent();
    return this.parseAddition();
  }

  private parseComponent(): HTML {
    const left = this.parseNonSkippableTags();
    if (left instanceof OpenTag) {
      const identifier = left.identifier.raw;
      const components = new Array<HTML>();
      while (this.hasMoreTokens()) {
        const right = this.parseComponent();
        if (right instanceof ClosingTag) {
          if (right.identifier.raw !== left.identifier.raw) {
            this.report(new ParserError(`Tag name '${right.identifier.raw}' is not a match for '${left.identifier.raw}'`, left.from, this.position));
          }
          return new Component(identifier, components, left.from, this.position);
        }
        if (right instanceof UnaryTag) continue;
        components.push(right);
      }
      this.expect(this.parseTag(), ClosingTag, new ParserError(`Expecting a closing tag for '${identifier}' component`, left.to, this.position));
      return new Component(identifier, components, left.from, this.position);
    }
    return left;
  }

  private parseNonSkippableTags() {
    const left = this.parseTag();
    if (left instanceof OpenTag || left instanceof UnaryTag) {
      if (left.identifier.raw == "meta" || left.identifier.raw == "link" || left.identifier.raw == "") {
        return this.parseComponent();
      }
    }
    return left;
  }

  private parseTag() {
    if (this.peekToken() instanceof LessThan) {
      const division = this.parseToken();
      let hasDivision = false;
      let identifier = new Identifier("", division.from, division.from);
      if (this.peekToken() instanceof Division) {
        this.parseToken();
        hasDivision = true;
      }
      if (this.peekToken() instanceof Identifier) {
        identifier = this.parseToken() as Identifier;
        if (this.peekToken() instanceof Number) {
          const number = this.parseToken();
          identifier.raw += (number as Number).raw;
          identifier.to = number.to;
        }
      }
      this.parseProperties();
      if (this.peekToken() instanceof Division) {
        this.parseToken();
        if (hasDivision) {
          this.report(new ParserError("Unexpected token '/' for this tag", division.from, this.position));
        }
        const token = this.expect(this.parseToken(), GreaterThan, new ParserError(`Expecting a closing '>' token for the tag`, division.from, this.position));
        return new UnaryTag(identifier, division.from, token.to);
      }
      const token = this.expect(this.parseToken(), GreaterThan, new ParserError(`Expecting a closing '>' token for the tag`, division.from, this.position));
      if (hasDivision) {
        return new ClosingTag(identifier, division.from, token.to);
      }
      return new OpenTag(identifier, division.from, token.to);
    }
    return this.parsePlainText();
  }

  private parsePlainText() {
    const from = this.position;
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof LessThan) {
        const token = this.parseTag();
        if (token instanceof Tag) {
          this.backtrack(token);
          break;
        }
      }
      this.getNextCharacter();
    }
    const properties = this.input.substring(from, this.position).replace(/\s+/g, " ").trim();
    return new PlainText(properties, from, this.position);
  }

  private parseProperties() {
    const from = this.position;
    while (this.hasMoreTokens()) {
      const token = this.getNextToken();
      if (token instanceof Division && this.peekToken() instanceof GreaterThan) {
        this.backtrack(token);
        break;
      }
      if (token instanceof GreaterThan) {
        this.backtrack(token);
        break;
      }
    }
    const properties = this.input.substring(from, this.position);
    return new Properties(properties, from, this.position);
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, operator.from, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, operator.from, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.token} operation`, operator.from, this.position));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.token} operation`, operator.from, this.position));
      left = new Binary(left, operator, right, left.from, right.to);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError(`Invalid expression in unary ${operator.token} operation`, operator.from, this.position));
      return new Unary(operator, right, operator.from, right.to);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const left = this.parseToken();
      const expression = this.expect(this.parseAddition(), Expression, new ParserError("No expression has been provided within parenthesis", left.from, this.position));
      const right = this.parseToken();
      if (expression instanceof Expression && !(expression instanceof ClosingParenthesis)) {
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
          this.report(new WarningError(`Unknown character '${token.raw}' found while parsing`, token.from, token.to));
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
      this.report(new WarningError(`Unknown character '${token.raw}' found while parsing`, token.from, token.to));
    }
    return token;
  }
}
