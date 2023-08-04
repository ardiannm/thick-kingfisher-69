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
import GreaterThan from "./graeter.than.ts";
import OpenTag from "./open.tag.ts";
import CloseTag from "./close.tag.ts";

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
    const expressions = new Array<Expression>(this.parseTag());
    while (this.hasMoreTokens()) expressions.push(this.parseTag());
    return new Program(expressions);
  }

  private parseTag() {
    if (this.peekToken() instanceof LessThan) {
      let open = true;
      this.getNextToken();
      if (this.peekToken() instanceof Division) {
        this.getNextToken();
        open = false;
      }
      const errorMessage = new ParserError(`Expecting a closing '>' token for the tag`);
      if (this.peekToken() instanceof Identifier) {
        const token = this.getNextToken() as Identifier;
        if (open) {
          const properties = this.parseProperties();
          return new OpenTag(token, properties);
        }
        this.expect(this.getNextToken(), GreaterThan, errorMessage);
        return new CloseTag(token);
      }
      this.expect(this.getNextToken(), GreaterThan, errorMessage);
      if (open) return new OpenTag();
      return new CloseTag();
    }
    return this.parseAddition();
  }

  private parseProperties() {
    const properties = new Array<Identifier>();
    while (this.peekToken() instanceof Identifier) {
      properties.push(this.expect(this.getNextToken(), Identifier, new ParserError(`Ivalid property for the tag`)) as Identifier);
    }
    return properties;
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.type} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.type} operation`));
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError(`Invalid expression in unary ${operator.type} operation`));
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.expect(this.parseAddition(), Expression, new ParserError("Parenthesis expression cannot be empty"));
      const end = this.expect(this.getNextToken(), CloseParenthesis, new ParserError("Missing a closing parenthesis in expression"));
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
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) this.logError(new WarningError(`Illegal chacater '${token.source}' found while parsing`));
        if (token instanceof Quote) break;
        source += this.getNextCharacter();
      }
      this.ignoreSpace();
      const end = this.expect(this.getNextToken(), Quote, new ParserError("Expecing a closing quote for the string"));
      return new String(begin, source, end);
    }
    return this.parseValue();
  }

  private parseValue() {
    const token = this.expect(this.getNextToken(), Value, new ParserError("Expecting a valid value in the program"));
    if (token instanceof UnknownCharacter) {
      this.logError(new WarningError(`Illegal chacater '${token.source}' found while parsing`));
    }
    if (token instanceof EOF) this.logError(new ParserError(`Unexpected end of Program`));
    return token;
  }
}
