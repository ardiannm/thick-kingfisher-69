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
import Program from "./program.ts";
import WarningError from "./warning.error.ts";
import LogError from "./log.error.ts";
import Substraction from "./substraction.ts";
import Addition from "./addition.ts";
import Exponentiation from "./exponentiation.ts";
import LessThan from "./less.than.ts";
import Identifier from "./identifier.ts";
import GreaterThan from "./greater.than.ts";
import TokenInfo from "./token.info.ts";
import TagProperties from "./tag.properties.ts";
import UnaryTag from "./unary.tag.ts";
import ClosingTag from "./closing.tag.ts";
import OpenTag from "./open.tag.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";
import Token from "./token.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  public tree!: Token;

  private assert<T extends Token>(instance: Token, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T extends Token>(token: Token, constructor: Constructor<T>, error: LogError): T {
    if (this.assert(token, constructor)) return token as T;
    this.logError(error, token);
    return token as T;
  }

  public parse() {
    this.tree = this.parseProgram();
    return this.tree;
  }

  private parseProgram() {
    const expressions = new Array<Expression>(this.parseTag());
    while (this.hasMoreTokens()) {
      expressions.push(this.parseTag());
    }
    return new Program(expressions, new TokenInfo(0, this.input.length));
  }

  private parseTag() {
    if (this.peekToken() instanceof LessThan) {
      const division = this.getNextToken();
      let hasDivision = false;
      let tagName = new Identifier("", new TokenInfo(division.info.from, division.info.from));
      if (this.peekToken() instanceof Division) {
        this.getNextToken();
        hasDivision = true;
      }
      if (this.peekToken() instanceof Identifier) tagName = this.getNextToken() as Identifier;
      const properties = this.parseProperties();
      if (this.peekToken() instanceof Division) {
        const otherDivision = this.getNextToken();
        if (hasDivision) this.logError(new ParserError("Unexpected token '/' for this tag"), otherDivision);
        const token = this.expect(this.getNextToken(), GreaterThan, new ParserError(`Expecting a closing '>' token for the tag`));
        return new UnaryTag(tagName, properties, new TokenInfo(division.info.from, token.info.to));
      }
      const token = this.expect(this.getNextToken(), GreaterThan, new ParserError(`Expecting a closing '>' token for the tag`));
      if (hasDivision) return new ClosingTag(tagName, properties, new TokenInfo(division.info.from, token.info.to));
      return new OpenTag(tagName, properties, new TokenInfo(division.info.from, token.info.to));
    }
    return this.parseAddition();
  }

  private parseProperties() {
    const from = this.position;
    while (this.hasMoreTokens()) {
      const token = this.getNextToken();
      if (token instanceof Division) {
        if (this.peekToken() instanceof GreaterThan) {
          this.snapBackTo(token);
          break;
        }
      }
      if (token instanceof GreaterThan) {
        this.snapBackTo(token);
        break;
      }
    }
    const properties = this.input.substring(from, this.position);
    return new TagProperties(properties, new TokenInfo(from, this.position));
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.formatName()} operation`));
      const right = this.expect(this.parseMultiplication(), Expression, new ParserError(`Invalid right hand side expression in ${operator.formatName()} operation`));
      left = new Binary(left, operator, right, new TokenInfo(left.info.from, right.info.to));
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.formatName()} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.formatName()} operation`));
      left = new Binary(left, operator, right, new TokenInfo(left.info.from, right.info.to));
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, new ParserError(`Invalid left hand side expression in ${operator.formatName()} operation`));
      const right = this.expect(this.parsePower(), Expression, new ParserError(`Invalid right hand side expression in ${operator.formatName()} operation`));
      left = new Binary(left, operator, right, new TokenInfo(left.info.from, right.info.to));
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, new ParserError(`Invalid expression in unary ${operator.formatName()} operation`));
      return new Unary(operator, right, new TokenInfo(operator.info.from, right.info.to));
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const left = this.getNextToken();
      const expression = this.expect(this.parseAddition(), Expression, new ParserError("No expression has been provided within parenthesis"));
      const right = this.getNextToken();
      if (expression instanceof Expression && !(expression instanceof ClosingParenthesis)) {
        this.expect(right, ClosingParenthesis, new ParserError("Expecting a closing parenthesis"));
      }
      return new Parenthesis(left as OpenParenthesis, expression, right as ClosingParenthesis, new TokenInfo(left.info.from, right.info.to));
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.keepSpace();
      const begin = this.getNextToken() as Quote;
      let raw = "";
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof UnknownCharacter) {
          this.logError(new WarningError(`Unknown character '${token.raw}' found while parsing`), token);
        }
        if (token instanceof Quote) break;
        raw += this.getNextChar();
      }
      const end = this.expect(this.getNextToken(), Quote, new ParserError("Expecing a closing quote for the string"));
      this.ignoreSpace();
      return new String(begin, raw, end, new TokenInfo(begin.info.to, end.info.from));
    }
    return this.parseToken();
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof UnknownCharacter) {
      this.logError(new WarningError(`Unknown character '${token.raw}' found while parsing`), token);
    }
    return token;
  }
}
