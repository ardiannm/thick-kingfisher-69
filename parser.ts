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
import Info from "./info.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<Class> = new (...args: any[]) => Class;

export default class Parser extends Lexer {
  //

  private colorize(str: string, code = 26) {
    return "\n" + `\u001b[38;5;${code}m${str}\u001b[0m`;
  }

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token>(token: Token, tokenConstructor: Constructor<T>, message: string): T {
    if (this.assert(token, tokenConstructor)) return token as T;
    const error = new ParserError(message, token);
    this.report(error);
    throw error;
  }

  private doNotExpect<T extends Token>(token: Token, tokenConstructor: Constructor<T>, message: string): T {
    if (this.assert(token, tokenConstructor)) {
      const error = new ParserError(message, token);
      this.report(error);
      throw error;
    }
    return token as T;
  }

  protected report(error: ParserError) {
    console.log(this.colorize(error.message));
    return error;
  }

  public parse() {
    return this.parseProgram();
  }

  private parseProgram() {
    try {
      const from = this.pointer;
      this.doNotExpect(this.peekToken(), EOF, "program cannot be empty");
      const expressions = new Array<Expression>();
      while (this.hasMoreTokens()) {
        expressions.push(this.parseHTML());
      }
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      const program = new Program(id, expressions);

      //

      const temp = this.colorize(JSON.stringify(program, null, 3));
      console.log(temp);
      console.log();
      console.log(this.info);

      //

      return program;
    } catch (report) {
      return report;
    }
  }

  private parseHTML() {
    if (this.peekToken() instanceof LessThan) {
      return this.parseTag();
    }
    return this.expect(this.parseMath(), Expression, "math expression expected in the program");
  }

  private parseTag() {
    const from = this.pointer;
    this.expect(this.getNextToken(), LessThan, "expecting a open '<' token");
    const tag = this.parseUniTag();
    this.expect(this.getNextToken(), GreaterThan, "expecting a closing '>' token");
    const to = this.pointer;
    const info = this.info.get(tag.id) as Info;
    info.from = from;
    info.to = to;
    return tag;
  }

  private parseUniTag() {
    const left = this.parseOpenTag();
    if (this.peekToken() instanceof Division) {
      const from = this.pointer;
      const right = this.expect(left, OpenTag, "unexpected token '/' found for this tag");
      this.getNextToken();
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      return new UniTag(id, left.identifier, right.properties);
    }
    return left;
  }

  private parseOpenTag() {
    const from = this.pointer;
    if (this.peekToken() instanceof Division) {
      return this.parseClosingTag();
    }
    const identifier = this.expect(this.getNextToken(), Identifier, "expecting identifier for an open tag");
    const properties = this.parseProperties();
    const to = this.pointer;
    const id = this.storeInfo(from, to);
    return new OpenTag(id, identifier, properties);
  }

  private parseClosingTag() {
    const from = this.pointer;
    this.expect(this.getNextToken(), Division, "expecting '/' for a closing tag");
    const identifier = this.expect(this.getNextToken(), Identifier, "expecting an identifier for this closing tag");
    const to = this.pointer;
    const id = this.storeInfo(from, to);
    return new ClosingTag(id, identifier);
  }

  private parseProperties() {
    const from = this.pointer;
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let view = "";
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        view = this.expect(this.parseString(), String, "expecting a string value after '=' token following a tag property").view;
      }
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      props.push(new Property(id, identifier, view));
    }
    return props;
  }

  private parseMath() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const from = this.pointer;
      this.expect(left, Expression, `invalid left hand side in ${this.peekToken().token} expression`);
      const operator = this.getNextToken() as Operator;
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parseMultiplication(), Expression, `invalid right hand side in ${operator.token} expression`);
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const from = this.pointer;
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, `invalid left hand side in ${operator.token} expression`);
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side in ${operator.token} expression`);
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const from = this.pointer;
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, `invalid left hand side in ${operator.token} expression`);
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side in ${operator.token} expression`);
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const from = this.pointer;
      const operator = this.getNextToken() as Operator;
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parseUnary(), Expression, `invalid expression in ${operator.token} expression`);
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      return new Unary(id, operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const from = this.pointer;
      this.getNextToken();
      this.doNotExpect(this.peekToken(), ClosingParenthesis, "no expression provided within parenthesis statement");
      const expression = this.expect(this.parseAddition(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), ClosingParenthesis, "expecting to close this parenthesis");
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      return new Parenthesis(id, expression);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const from = this.pointer;
      this.keepSpace();
      this.getNextToken() as Quote;
      let view = "";
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) {
          this.report(new WarningError(`unknown character '${token.view}' found while parsing`, token));
        }
        if (token instanceof Quote) break;
        view += this.getNext();
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      const to = this.pointer;
      const id = this.storeInfo(from, to);
      return new String(id, view);
    }
    return this.parseLiteral();
  }

  private parseLiteral() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.report(new WarningError(`unknown character '${token.view}' found while parsing`, token));
    }
    return token;
  }
}
