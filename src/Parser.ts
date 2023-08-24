import Lexer from "./Lexer";
import Program from "./tokens/Program";
import Expression from "./tokens/Expression";
import Newline from "./tokens/Newline";
import LessThan from "./tokens/LessThan";
import Slash from "./tokens/Slash";
import Power from "./tokens/Power";
import Identifier from "./tokens/Identifier";
import GreaterThan from "./tokens/GreaterThan";
import UniTag from "./tokens/UinTag";
import Operator from "./tokens/Operator";
import Equals from "./tokens/Equals";
import Minus from "./tokens/Minus";
import EOF from "./tokens/EOF";
import OpenTag from "./tokens/OpenTag";
import Attribute from "./tokens/Attribute";
import Plus from "./tokens/Plus";
import Product from "./tokens/Product";
import OpenParenthesis from "./tokens/OpenParenthesis";
import CloseParenthesis from "./tokens/CloseParenthesis";
import Character from "./tokens/Character";
import Quote from "./tokens/Quote";
import Token from "./tokens/Token";
import ParseError from "./tokens/ParseError";
import Substraction from "./tokens/Substraction";
import Positive from "./tokens/Positive";
import Negative from "./tokens/Negative";
import Division from "./tokens/Division";
import Addition from "./tokens/Addition";
import Multiplication from "./tokens/Multiplication";
import Exponentiation from "./tokens/Exponentiation";
import String from "./tokens/String";
import Parenthesis from "./tokens/Parenthesis";
import CloseTag from "./tokens/CloseTag";
import Register from "./tokens/Register";
import Constructor from "./tokens/Constructor";
import Tag from "./tokens/Tag";
import HTML from "./tokens/HTML";

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
    return this.expect(this.parseAddition(), Expression, "Math expression or HTML content expected in the program");
  }

  @Register(Tag)
  private parseTag() {
    this.expect(this.getNextToken(), LessThan, "Expecting a open '<' token");
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      const identifier = this.expect(this.parseToken(), Identifier, "Expecting identifier for this closing tag");
      this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
      return new CloseTag(identifier.view);
    }
    const identifier = this.expect(this.parseToken(), Identifier, "Expecting identifier for this open tag");
    const properties = this.parseAttributes();
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
      return new UniTag(identifier.view, properties);
    }
    this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
    return new OpenTag(identifier.view, properties);
  }

  private parseAttributes() {
    const props = new Array<Attribute>();
    while (this.peekToken() instanceof Identifier) {
      props.push(this.parseAttribute());
    }
    return props;
  }

  @Register(Attribute)
  private parseAttribute() {
    const identifier = this.parseToken() as Identifier;
    let view = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      view = this.expect(this.parseString(), String, "Expecting a string value after '=' token following a tag property").view;
    }
    return new Attribute(identifier.view, view);
  }

  @Register(Addition)
  @Register(Substraction)
  private parseAddition() {
    const left = this.parseMultiplication();
    if (this.peekToken() instanceof Plus) {
      this.expect(left, Expression, "Invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of binary expression");
      const right = this.expect(this.parseAddition(), Expression, "Invalid right hand side in binary expression");
      return new Addition(left, right);
    }
    if (this.peekToken() instanceof Minus) {
      this.expect(left, Expression, "Invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of binary expression");
      const right = this.expect(this.parseAddition(), Expression, "Invalid right hand side in binary expression");
      return new Substraction(left, right);
    }
    return left;
  }

  @Register(Division)
  @Register(Multiplication)
  private parseMultiplication() {
    const left = this.parsePower();
    if (this.peekToken() instanceof Product) {
      this.expect(left, Expression, "Invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of binary expression");
      const right = this.expect(this.parseMultiplication(), Expression, "Invalid right hand side in binary expression");
      return new Multiplication(left, right);
    }
    if (this.peekToken() instanceof Slash) {
      this.expect(left, Expression, "Invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of binary expression");
      const right = this.expect(this.parseMultiplication(), Expression, "Invalid right hand side in binary expression");
      return new Division(left, right);
    }
    return left;
  }

  @Register(Exponentiation)
  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      this.getNextToken();
      this.expect(left, Expression, "Invalid left hand side in binary expression");
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of binary expression");
      const right = this.expect(this.parsePower(), Expression, "Invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  }

  @Register(Positive)
  @Register(Negative)
  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "Unexpected ending of unary expression");
      const right = this.expect(this.parseUnary(), Expression, "Invalid expression in unary expression");
      if (operator instanceof Plus) return new Positive(right);
      return new Negative(right);
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
      this.getNextToken();
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
