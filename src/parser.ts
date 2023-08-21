import Lexer from "./lexer";
import Program from "./program";
import Expression from "./expression";
import Newline from "./newline";
import LessThan from "./less.than";
import Division from "./division";
import Exponentiation from "./exponentiation";
import Identifier from "./identifier";
import GreaterThan from "./greater.than";
import UniTag from "./uni.tag";
import Operator from "./operator";
import Equals from "./equals";
import Substraction from "./substraction";
import EOF from "./eof";
import OpenTag from "./open.tag";
import Property from "./property";
import Addition from "./addition";
import Multiplication from "./multiplication";
import OpenParenthesis from "./open.parenthesis";
import ClosingParenthesis from "./closing.parenthesis";
import Character from "./character";
import Quote from "./quote";
import Token from "./token";
import UnknownCharacter from "./unknown.character";
import WarningError from "./warning.error";
import Binary from "./binary";
import Unary from "./unary";
import ParserError from "./parser.error";
import String from "./string";
import Parenthesis from "./parenthesis";
import ClosingTag from "./closing.tag";

// deno-lint-ignore no-explicit-any
export type Constructor<Class> = new (...args: any[]) => Class;

export default class Parser extends Lexer {
  //

  public parse() {
    return this.parseProgram();
  }

  private parseProgram() {
    try {
      const data = this.keepState();
      this.doNotExpect(this.peekToken(), EOF, "program cannot be empty");
      const expressions = new Array<Expression>();
      while (this.hasMoreTokens()) {
        expressions.push(this.parseHTML());
        if (this.hasMoreTokens()) {
          this.expect(this.getNextToken(), Newline, "new expression can only continue in a new line");
        }
      }
      const id = this.generate(data);
      const program = new Program(id, expressions);

      // Logging results

      const datas = Array.from(this.data)
        .map(([id, data]) => this.colorize(`token [${id}] \t ${data.from}:${data.to} \t ${data.to - data.from} \t line ${data.line}`))
        .join("");

      const tree = this.colorize(JSON.stringify(program, null, 3));

      console.log(datas);
      console.log(tree);

      // Returning results ...

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
    const data = this.keepState();
    this.expect(this.getNextToken(), LessThan, "expecting a open '<' token");
    const message = "expecting a closing '>' token for this tag";
    if (this.peekToken() instanceof Division) {
      this.getNextToken();
      const identifier = this.expect(this.parseLiteral(), Identifier, "expecting identifier for this closing tag");
      this.expect(this.getNextToken(), GreaterThan, message);
      const id = this.generate(data);
      return new ClosingTag(id, identifier);
    }
    const identifier = this.expect(this.parseLiteral(), Identifier, "expecting identifier for this open tag");
    const properties = this.parseProperties();
    if (this.peekToken() instanceof Division) {
      this.getNextToken();
      this.expect(this.getNextToken(), GreaterThan, message);
      const id = this.generate(data);
      return new UniTag(id, identifier, properties);
    }
    const id = this.generate(data);
    this.expect(this.getNextToken(), GreaterThan, message);
    return new OpenTag(id, identifier, properties);
  }

  private parseProperties() {
    const data = this.keepState();
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      const identifier = this.getNextToken() as Identifier;
      let view = "";
      if (this.peekToken() instanceof Equals) {
        this.getNextToken();
        view = this.expect(this.parseString(), String, "expecting a string value after '=' token following a tag property").view;
      }
      const id = this.generate(data);
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
      const data = this.keepState();
      this.expect(left, Expression, `invalid left hand side in ${this.peekToken().token} expression`);
      const operator = this.getNextToken() as Operator;
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parseMultiplication(), Expression, `invalid right hand side in ${operator.token} expression`);
      const id = this.generate(data);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const data = this.keepState();
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, `invalid left hand side in ${operator.token} expression`);
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side in ${operator.token} expression`);
      const id = this.generate(data);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Exponentiation) {
      const data = this.keepState();
      const operator = this.getNextToken() as Operator;
      this.expect(left, Expression, `invalid left hand side in ${operator.token} expression`);
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parsePower(), Expression, `invalid right hand side in ${operator.token} expression`);
      const id = this.generate(data);
      left = new Binary(id, left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Addition || this.peekToken() instanceof Substraction) {
      const data = this.keepState();
      const operator = this.getNextToken() as Operator;
      this.doNotExpect(this.peekToken(), EOF, `unexpected ending of ${operator.token} expression`);
      const right = this.expect(this.parseUnary(), Expression, `invalid expression in ${operator.token} expression`);
      const id = this.generate(data);
      return new Unary(id, operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const data = this.keepState();
      this.getNextToken();
      this.doNotExpect(this.peekToken(), ClosingParenthesis, "no expression provided within parenthesis statement");
      const expression = this.expect(this.parseAddition(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), ClosingParenthesis, "expecting to close this parenthesis");
      const id = this.generate(data);
      return new Parenthesis(id, expression);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const data = this.keepState();
      this.getNextToken() as Quote;
      let view = "";
      this.keepSpace();
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        view += (this.parseLiteral() as Character).view;
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      const id = this.generate(data);
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
    console.log(this.colorize(`${error.message}, at token [${error.position.id}]`));
    return error;
  }

  private colorize(str: string, code = 26) {
    return "\n" + `\u001b[38;5;${code}m${str}\u001b[0m`;
  }
}
