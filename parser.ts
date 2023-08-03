import Lexer from "./lexer.ts";
import Value from "./value.ts";
import Plus from "./plus.ts";
import Binary from "./binary.ts";
import Operator from "./operator.ts";
import Expression from "./expression.ts";
import Minus from "./minus.ts";
import Multiplication from "./multiplication.ts";
import Division from "./division.ts";
import Power from "./power.ts";
import Unary from "./unary.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import CloseParenthesis from "./close.parenthesis.ts";
import Parenthesis from "./parenthesis.ts";
import Quote from "./quote.ts";
import DoubleQuoteString from "./double.quote.string.ts";
import ParserError from "./parser.error.ts";
import Program from "./program.ts";
import IllegalCharacter from "./invalid.ts";
import WarningError from "./warning.error.ts";
import LessThan from "./less.than.ts";
import Identifier from "./identifier.ts";
import GreaterThan from "./graeter.than.ts";
import Component from "./component.ts";
import OpenTag from "./open.tag.ts";
import EOF from "./eof.ts";
import CloseTag from "./close.tag.ts";
import LogError from "./log.error.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  //

  // help Program

  private assert<T>(instance: T, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T, R extends T>(token: T, constructor: Constructor<R>, error: LogError): R {
    if (this.assert(token, constructor)) return token as R;
    this.logError(error);
    return token as R;
  }

  // parse Program

  public parse() {
    const expressions = new Array<Expression>(this.parseComponent());
    while (this.hasMoreTokens()) {
      expressions.push(this.parseComponent());
    }
    return new Program(expressions);
  }

  private parseComponent() {
    const left = this.parseTag();
    if (left instanceof OpenTag) {
      const content = this.parseContent() as Component;
      return new Component(left.tagName, [content]);
    }
    return left;
  }

  private parseTag() {
    if (this.peekToken() instanceof LessThan) {
      this.getNextToken();
      if (this.peekToken() instanceof Division) {
        this.getNextToken();
        this.parseProperties();
        this.expect(this.getNextToken(), GreaterThan, new ParserError("Expecting a closing '>' for the tag"));
        return new CloseTag();
      }
      let tagName = "";
      if (this.peekToken() instanceof Identifier) {
        tagName = (this.getNextToken() as Identifier).source;
        this.parseProperties();
      } else {
        this.expect(this.getNextToken(), GreaterThan, new ParserError("Invalid name tag"));
      }
      this.expect(this.getNextToken(), GreaterThan, new ParserError("Expecting a closing '>' for the tag"));
      return new OpenTag(tagName);
    }
    return this.parseAddition();
  }

  private parseProperties() {
    while (!(this.peekToken() instanceof GreaterThan) && !(this.peekToken() instanceof EOF)) {
      this.getNextToken();
    }
  }

  private parseContent() {
    let source = "";
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof LessThan) return this.parseComponent();
      source += this.nextCharacter();
    }
    return source;
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError("Invalid right hand side expression in addition operation"));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parsePower(), Expression, new ParserError("Invalid right hand side expression in multiplication operation"));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parsePower(), Expression, new ParserError("Invalid right hand side expression in power operation"));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError("Invalid right hand side expression in unary operation"));
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.expect(this.parseAddition(), Expression, new ParserError("Parenthesis expression cannot be empty"));
      const end = this.expect(this.getNextToken(), CloseParenthesis, new ParserError("Missing a closing ')' in parenthesis expression"));
      return new Parenthesis(begin, expression, end);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const begin = this.getNextToken() as Quote;
      this.keepSpace();
      let source = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        source += this.nextCharacter();
      }
      this.ignoreSpace();
      const end = this.expect(this.getNextToken(), Quote, new ParserError("Missing a closing quote '\"' in the end of string"));
      return new DoubleQuoteString(begin, source, end);
    }
    return this.parseValue();
  }

  private parseValue() {
    const token = this.expect(this.getNextToken(), Value, new ParserError("Invalid syntax in the program"));
    if (token instanceof IllegalCharacter) {
      this.logError(new WarningError(`Illegal chacater '${token.source}' found while parsing`));
    }
    if (token instanceof EOF) this.logError(new ParserError(`Unexpected end of Program`));
    return token;
  }
}
