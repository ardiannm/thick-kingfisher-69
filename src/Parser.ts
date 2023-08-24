import Lexer from "./Lexer";
import Program from "./Program";
import Expression from "./Expression";
import Newline from "./Newline";
import LessThan from "./LessThan";
import Slash from "./Slash";
import Power from "./Power";
import Identifier from "./Identifier";
import GreaterThan from "./GreaterThan";
import UniTag from "./UinTag";
import Operator from "./Operator";
import Equals from "./Equals";
import Minus from "./Minus";
import EOF from "./EOF";
import OpenTag from "./OpenTag";
import Property from "./Property";
import Plus from "./Plus";
import Product from "./Product";
import OpenParenthesis from "./OpenParenthesis";
import CloseParenthesis from "./CloseParenthesis";
import Character from "./Character";
import Quote from "./Quote";
import Token from "./Token";
import Binary from "./Binary";
import Unary from "./Unary";
import ParseError from "./ParseError";
import String from "./String";
import Parenthesis from "./Parenthesis";
import CloseTag from "./CloseTag";
import Register from "./Register";
import Constructor from "./Constructor";
import Tag from "./Tag";
import HTML from "./HTML";

import Substraction from "./Substraction";
import Positive from "./Positive";
import Negative from "./Negative";
import Division from "./Division";
import Addition from "./Addition";
import Multiplication from "./Multiplication";
import Exponentiation from "./Exponentiation";

export default class Parser extends Lexer {
  //

  public parse() {
    try {
      return this.parseProgram();
    } catch (error) {
      return error;
    }
  }

  @Register(Program)
  private parseProgram() {
    this.doNotExpect(this.peekToken(), EOF, "Program can't be blank");
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      expressions.push(this.parseHTML());
      if (this.peekToken() instanceof Newline) this.getNextToken();
    }
    return new Program(expressions);
  }

  @Register(HTML)
  private parseHTML() {
    if (this.peekToken() instanceof LessThan) {
      return this.parseTag();
    }
    return this.expect(this.parseMath(), Expression, "Math expression or HTML content expected in the program");
  }

  @Register(Tag)
  private parseTag() {
    this.expect(this.getNextToken(), LessThan, "Expecting a open '<' token");
    const message = "Expecting a closing '>' token for this tag";
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      const identifier = this.expect(this.getNextToken(), Identifier, "Expecting identifier for this closing tag");
      this.expect(this.getNextToken(), GreaterThan, message);
      return new CloseTag(identifier);
    }
    const identifier = this.expect(this.getNextToken(), Identifier, "Expecting identifier for this open tag");
    const properties = this.parseProperties();
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      this.expect(this.getNextToken(), GreaterThan, message);
      return new UniTag(identifier, properties);
    }
    this.expect(this.getNextToken(), GreaterThan, message);
    return new OpenTag(identifier, properties);
  }

  private parseProperties() {
    const props = new Array<Property>();
    while (this.peekToken() instanceof Identifier) {
      props.push(this.parseProperty());
    }
    return props;
  }

  @Register(Property)
  private parseProperty() {
    const identifier = this.getNextToken() as Identifier;
    let view = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      view = this.expect(this.parseString(), String, "Expecting a string value after '=' token following a tag property").view;
    }
    return new Property(identifier, view);
  }

  private parseMath() {
    return this.parseAddition();
  }

  @Register(Addition)
  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      this.expect(left, Expression, `Invalid left hand side in ${this.peekToken().name} expression`);
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, `Unexpected ending of binary expression`);
      const right = this.expect(this.parseMultiplication(), Expression, `Invalid right hand side in binary expression`);
      left = new Addition(left, right);
    }
    return left;
  }

  @Register(Multiplication)
  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Product || this.peekToken() instanceof Slash) {
      this.getNextToken();
      this.expect(left, Expression, `Invalid left hand side in binary expression`);
      this.doNotExpect(this.peekToken(), EOF, `Unexpected ending of binary expression`);
      const right = this.expect(this.parsePower(), Expression, `Invalid right hand side in binary expression`);
      left = new Multiplication(left, right);
    }
    return left;
  }

  @Register(Exponentiation)
  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      this.getNextToken();
      this.expect(left, Expression, `Invalid left hand side in binary expression`);
      this.doNotExpect(this.peekToken(), EOF, `Unexpected ending of binary expression`);
      const right = this.expect(this.parsePower(), Expression, `Invalid right hand side in binary expression`);
      left = new Exponentiation(left, right);
    }
    return left;
  }

  @Register(Unary)
  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      this.doNotExpect(this.peekToken(), EOF, `Unexpected ending of unary expression`);
      const right = this.expect(this.parseUnary(), Expression, `Invalid expression in unary expression`);
      return operator instanceof Plus ? new Positive(right) : new Negative(right);
    }
    return this.parseParanthesis();
  }

  @Register(Parenthesis)
  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      this.doNotExpect(this.peekToken(), CloseParenthesis, "Parenthesis closed with no expression");
      const expression = this.expect(this.parseAddition(), Expression, "Expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), CloseParenthesis, "Expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return this.parseString();
  }

  @Register(String)
  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.getNextToken() as Quote;
      let view = "";
      this.keepSpace();
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        view += (this.getNextToken() as Character).view;
      }
      this.expect(this.getNextToken(), Quote, "Expecting a closing quote for the string");
      this.ignoreSpace();
      return new String(view);
    }
    return this.parseToken();
  }

  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  private expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    const error = new ParseError(message);
    this.report(error);
    throw error;
  }

  private doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      const error = new ParseError(message);
      this.report(error);
      throw error;
    }
    return token as T;
  }
}
