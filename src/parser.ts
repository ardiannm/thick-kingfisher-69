import Lexer from "./Lexer";
import Program from "./Program";
import Expression from "./Expression";
import Newline from "./Newline";
import LessThan from "./less.than";
import Division from "./Division";
import Exponentiation from "./Exponentiation";
import Identifier from "./Identifier";
import GreaterThan from "./GreaterThan";
import UniTag from "./UinTag";
import Operator from "./Operator";
import Equals from "./Equals";
import Substraction from "./Substraction";
import EOF from "./EOF";
import OpenTag from "./OpenTag";
import Property from "./Property";
import Addition from "./Addition";
import Multiplication from "./Multiplication";
import OpenParenthesis from "./OpenParenthesis";
import ClosingParenthesis from "./ClosingParenthesis";
import Character from "./Character";
import Quote from "./Quote";
import Token from "./Token";
import Binary from "./Binary";
import Unary from "./Unary";
import ParserError from "./ParserError";
import String from "./String";
import Parenthesis from "./Parenthesis";
import ClosingTag from "./ClosingTag";
import SpecialCharacter from "./SpecialCharacters";

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
        this.expect(this.getNextToken(), SpecialCharacter, "expression must end with a ';'");
        if (this.hasMoreTokens()) {
          this.expect(this.getNextToken(), Newline, "new expression can only continue in a new line");
        }
      }
      const id = this.generate(data);
      const program = new Program(id, expressions);

      console.log(JSON.stringify(program, null, 3));

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
      const identifier = this.expect(this.getNextToken(), Identifier, "expecting identifier for this closing tag");
      this.expect(this.getNextToken(), GreaterThan, message);
      const id = this.generate(data);
      return new ClosingTag(id, identifier);
    }
    const identifier = this.expect(this.getNextToken(), Identifier, "expecting identifier for this open tag");
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
        view += (this.getNextToken() as Character).view;
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      const id = this.generate(data);
      return new String(id, view);
    }
    return this.getNextToken();
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
}
