import Lexer from "./lexer.ts";
import UnknownCharacter from "./unknown.character.ts";
import EOF from "./eof.ts";
import Value from "./value.ts";
import Binary from "./binary.ts";
import Operator from "./operator.ts";
import Expression from "./expression.ts";
import Multiplication from "./multiplication.ts";
import Division from "./division.ts";
import Unary from "./unary.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import CloseParenthesis from "./close.parenthesis.ts";
import Parenthesis from "./parenthesis.ts";
import Quote from "./quote.ts";
import String from "./string.ts";
import ParserError from "./parser.error.ts";
import Program from "./program.ts";
import WarningError from "./warning.error.ts";
import LogError from "./log.error.ts";
import Substraction from "./substraction.ts";
import Addition from "./addition.ts";
import Exponentiation from "./exponentiation.ts";
import LessThan from "./less.than.ts";
import Identifier from "./identifier.ts";
import GreaterThan from "./greater.than.ts";
import OpenTag from "./open.tag.ts";
import CloseTag from "./close.tag.ts";
import TokenInfo from "./token.info.ts";
import TagProperties from "./tag.properties.ts";

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
    return this.parseProgram();
  }

  private parseProgram() {
    const startsAt = this.position;
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) expressions.push(this.parseTag());
    return new Program(expressions, new TokenInfo(startsAt, this.position));
  }

  private parseTag() {
    if (this.peekToken() instanceof LessThan) {
      const startsAt = this.position;
      let open = true;
      let tagName = new Identifier("", new TokenInfo(startsAt, startsAt));
      let properties = new TagProperties("", new TokenInfo(startsAt, startsAt));
      this.getNextToken();
      if (this.peekToken() instanceof Division) {
        this.getNextToken();
        open = false;
      }
      const message = new ParserError(`Expecting a closing '>' token for the tag`);
      if (this.peekToken() instanceof Identifier) {
        tagName = this.getNextToken() as Identifier;
        properties = this.parseProperties();
        this.expect(this.getNextToken(), GreaterThan, message);
        if (open) return new OpenTag(tagName, properties, new TokenInfo(startsAt, this.position));
        return new CloseTag(tagName, properties, new TokenInfo(startsAt, this.position));
      }
      properties = new TagProperties(properties.string, new TokenInfo(startsAt, this.position));
      this.expect(this.getNextToken(), GreaterThan, message);
      if (open) return new OpenTag(tagName, properties, new TokenInfo(startsAt, this.position));
      return new CloseTag(tagName, properties, new TokenInfo(startsAt, this.position));
    }
    return this.parseAddition();
  }

  private parseProperties() {
    let properties = "";
    const startsAt = this.position;
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof GreaterThan) break;
      properties += this.getNextChar();
    }
    return new TagProperties(properties, new TokenInfo(startsAt, this.position));
  }

  private parseAddition() {
    const startsAt = this.position;
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right, new TokenInfo(startsAt, this.position));
    }
    return left;
  }

  private parseMultiplication() {
    const startsAt = this.position;
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right, new TokenInfo(startsAt, this.position));
    }
    return left;
  }

  private parsePower() {
    const startsAt = this.position;
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right, new TokenInfo(startsAt, this.position));
    }
    return left;
  }

  private parseUnary(): Expression {
    const startsAt = this.position;
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError(`Invalid expression in unary ${operator.type} operation`));
      return new Unary(operator, right, new TokenInfo(startsAt, this.position));
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    const startsAt = this.position;
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.expect(this.parseAddition(), Expression, new ParserError("Parenthesis expression cannot be empty"));
      const end = this.expect(this.getNextToken(), CloseParenthesis, new ParserError("Missing a closing parenthesis in expression"));
      return new Parenthesis(begin, expression, end, new TokenInfo(startsAt, this.position));
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const begin = this.getNextToken() as Quote;
      let string = "";
      this.keepSpace();
      const startsAt = this.position;
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) this.logError(new WarningError(`Illegal chacater '${token.string}' found while parsing`));
        if (token instanceof Quote) break;
        string += this.getNextChar();
      }
      this.ignoreSpace();
      const endsAt = this.position;
      const end = this.expect(this.getNextToken(), Quote, new ParserError("Expecing a closing quote for the string"));
      return new String(begin, string, end, new TokenInfo(startsAt, endsAt));
    }
    return this.parseValue();
  }

  private parseValue() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.logError(new WarningError(`Illegal chacater '${token.string}' found while parsing`));
    }
    if (token instanceof EOF) {
      this.logError(new ParserError(`Unexpected end of Program`));
    }
    return this.expect(token, Value, new ParserError("Expecting a valid value in the program"));
  }
}
