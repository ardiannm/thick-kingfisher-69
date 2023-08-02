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
import Tag from "./tag.ts";
import Component from "./component.ts";
import OpenTag from "./open.tag.ts";
import EOF from "./eof.ts";
import SyntaxError from "./syntax.error.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  //

  // help Program

  private assert<T>(instance: T, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T, R extends T>(token: T, constructor: Constructor<R>, message: string): R {
    if (this.assert(token, constructor)) return token as R;
    this.logError(new ParserError(message, this.position));
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
    const left = this.parseOpenTag();
    if (left instanceof Tag) {
      const content = this.parseContent() as Component;
      return new Component(left.tagName, [content]);
    }
    return left;
  }

  private parseOpenTag() {
    if (this.peekToken() instanceof LessThan) {
      this.getNextToken();
      const left = this.getNextToken() as Identifier;
      const identifier = this.expect(left, Identifier, `Expecting a name identifier for this tag element but received a '${left.source}' ${left.type} token`);
      while (!(this.peekToken() instanceof GreaterThan)) {
        this.getNextToken();
      }
      this.expect(this.getNextToken(), GreaterThan, `Expecting a closing '>' token in the tag`);
      return new OpenTag(identifier.source);
    }
    return this.parseAddition();
  }

  private parseContent() {
    let source = "";
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof LessThan) {
        return this.parseComponent();
      }
      source += this.nextCharacter();
    }
    return source;
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseMultiplication(), Expression, "Invalid right hand side expression in addition operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parsePower(), Expression, "Invalid right hand side expression in multiplication operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parsePower(), Expression, "Invalid right hand side expression in power operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, "Invalid right hand side expression in unary operation");
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.expect(this.parseAddition(), Expression, "Parenthesis expression cannot be empty");
      const end = this.expect(this.getNextToken(), CloseParenthesis, "Missing a closing ')' in parenthesis expression");
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
      const end = this.expect(this.getNextToken(), Quote, "Missing a closing quote '\"' in the end of string");
      return new DoubleQuoteString(begin, source, end);
    }
    return this.parseValue();
  }

  private parseValue() {
    const token = this.expect(this.getNextToken(), Value, "Invalid syntax in the program");
    if (token instanceof EOF) {
      this.logError(new SyntaxError(`No syntax was provided. Programming code cannot be empty`, this.position));
    }
    if (token instanceof IllegalCharacter) {
      this.logError(new WarningError(`Illegal chacater '${token.source}' found while parsing`, this.position));
    }
    console.log(token);
    return token;
  }
}
