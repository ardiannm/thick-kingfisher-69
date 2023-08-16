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
import Parenthesis from "./parenthesis.ts";
import EOF from "./eof.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<Class> = new (...args: any[]) => Class;

export default class Parser extends Lexer {
  //

  private colorize(str: string, code = 63) {
    return `\u001b[38;5;${code}m${str}\u001b[0m`;
  }

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token>(token: Token, tokenConstructor: Constructor<T>, message: string): T {
    if (this.assert(token, tokenConstructor)) return token as T;
    const error = new ParserError(message, token);
    this.log(error);
    throw error;
  }

  private doNotExpect<T extends Token>(token: Token, tokenConstructor: Constructor<T>, message: string): T {
    if (this.assert(token, tokenConstructor)) {
      const error = new ParserError(message, token);
      this.log(error);
      throw error;
    }
    return token as T;
  }

  protected log(error: ParserError) {
    console.log();
    console.log(this.colorize(error.message));
    return error;
  }

  public parse() {
    try {
      return this.parseProgram();
    } catch (err) {
      return err;
    }
  }

  private parseProgram() {
    this.doNotExpect(this.peekToken(), EOF, "program cannot be empty");
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      expressions.push(this.parseHTML());
    }
    return new Program(expressions, 0, this.input.length);
  }

  private parseHTML() {
    if (this.peekToken() instanceof LessThan) {
      return this.parseTag();
    }
    return this.expect(this.parseMath(), Expression, "math expression expected in the program");
  }

  private parseTag() {
    this.expect(this.parseToken(), LessThan, "expecting a open '<' token");
    const tag = this.parseUniTag();
    this.expect(this.parseToken(), GreaterThan, "expecting a closing '>' token");
    return tag;
  }

  private parseUniTag() {
    const left = this.parseOpenTag();
    if (this.peekToken() instanceof Division) {
      const right = this.expect(left, OpenTag, "unexpected token '/' found for this tag");
      this.parseToken();
      return new UniTag(left.identifier, right.properties);
    }
    return left;
  }

  private parseOpenTag() {
    if (this.peekToken() instanceof Division) {
      return this.parseClosingTag();
    }
    const identifier = this.expect(this.parseToken(), Identifier, "expecting identifier for an open tag");
    const properties = this.parseProperties();
    return new OpenTag(identifier, properties);
  }

  private parseClosingTag() {
    this.expect(this.parseToken(), Division, "expecting '/' for a closing tag");
    const identifier = this.expect(this.parseToken(), Identifier, "expecting an identifier for this closing tag");
    return new ClosingTag(identifier);
  }

  private parseProperties() {
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let view = "";
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        view = this.expect(this.parseString(), String, "expecting a string value after '=' token following a tag property").view;
      }
      props.push(new Property(identifier, view));
    }
    return props;
  }

  private parseMath() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      this.expect(left, Expression, `invalid left hand side expression in ${this.peekToken().token} operation`);
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseMultiplication(), Expression, `invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, `invalid left hand side expression in ${operator.token} operation`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.parseToken() as Operator;
      this.expect(left, Expression, `invalid left hand side expression in ${operator.token} operation`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side expression in ${operator.token} operation`);
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.parseToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, `invalid expression in unary ${operator.token} operation`);
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      this.doNotExpect(this.peekToken(), ClosingParenthesis, "no expression provided within parenthesis statement");
      const expression = this.expect(this.parseAddition(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), ClosingParenthesis, "expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.keepSpace();
      this.getNextToken() as Quote;
      let view = "";
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) {
          this.log(new WarningError(`unknown character '${token.view}' found while parsing`, token));
        }
        if (token instanceof Quote) break;
        view += this.getNext();
      }
      this.expect(this.parseToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      return new String(view);
    }
    return this.parseToken();
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.log(new WarningError(`unknown character '${token.view}' found while parsing`, token));
    }
    return token;
  }
}
