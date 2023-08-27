import Lexer from "./Lexer";
import Program from "./tokens/expressions/Program";
import Expression from "./tokens/expressions/Expression";
import Slash from "./tokens/operators/Slash";
import Power from "./tokens/operators/Power";
import Identifier from "./tokens/expressions/Identifier";
import GreaterThan from "./tokens/basic/GreaterThan";
import UniTag from "./tokens/html/UinTag";
import Equals from "./tokens/basic/Equals";
import Minus from "./tokens/operators/Minus";
import EOF from "./tokens/basic/EOF";
import OpenTag from "./tokens/html/OpenTag";
import Attribute from "./tokens/html/Attribute";
import Plus from "./tokens/operators/Plus";
import Product from "./tokens/operators/Product";
import OpenParenthesis from "./tokens/basic/OpenParenthesis";
import CloseParenthesis from "./tokens/basic/CloseParenthesis";
import Character from "./tokens/basic/Character";
import Quote from "./tokens/basic/Quote";
import Token from "./tokens/basic/Token";
import ParseError from "./utils/ParseError";
import Substraction from "./tokens/expressions/Substraction";
import Positive from "./tokens/expressions/Positive";
import Negative from "./tokens/expressions/Negative";
import Division from "./tokens/expressions/Division";
import Addition from "./tokens/expressions/Addition";
import Multiplication from "./tokens/expressions/Multiplication";
import Exponentiation from "./tokens/expressions/Exponentiation";
import String from "./tokens/expressions/String";
import Parenthesis from "./tokens/expressions/Parenthesis";
import CloseTag from "./tokens/html/CloseTag";
import InjectId from "./utils/InjectId";
import Constructor from "./utils/Constructor";
import LessThan from "./tokens/basic/LessThan";
import OpenScriptTag from "./tokens/html/OpenScriptTag";
import CloseScriptTag from "./tokens/html/CloseScriptTag";
import Script from "./tokens/html/Script";
import Component from "./tokens/html/Component";

export default class Parser extends Lexer {
  public parse() {
    try {
      return this.parseProgram();
    } catch (error) {
      return error;
    }
  }

  @InjectId
  private parseProgram() {
    this.doNotExpect(this.peekToken(), EOF, "Program can't be blank");
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      expressions.push(this.parseHTML());
    }
    return new Program(expressions);
  }

  @InjectId
  private parseHTML() {
    if (this.peekToken() instanceof LessThan) return this.parseComponent();
    return this.parseAddition();
  }

  @InjectId
  private parseComponent() {
    const left = this.parseScript();
    if (left instanceof OpenTag) {
      const children = new Array<Component>();
      while (this.hasMoreTokens()) {
        const right = this.parseComponent();
        if (right instanceof CloseTag) {
          return new Component(left, children, right);
        }
        const component = this.expect(right, Component, "Token is not a valid component");
        children.push(component);
      }
    }
    return left;
  }

  @InjectId
  private parseScript() {
    const left = this.parseTag();
    if (left instanceof OpenScriptTag) {
      let view = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof LessThan) break;
        view += this.getNext();
      }
      try {
        const right = this.expect(this.parseScript(), CloseScriptTag, "Expecting a closing script tag");
        return new Script(left, view, right);
      } catch (error) {
        this.expect(error, CloseScriptTag, "Expecting a closing script tag");
      }
    }
    return left;
  }

  @InjectId
  private parseTag() {
    this.getNextToken();
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      const identifier = this.expect(this.getNextToken(), Identifier, "Expecting identifier for this closing tag");
      this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
      if (identifier.view === "script") return new CloseScriptTag();
      return new CloseTag(identifier.view);
    }
    const identifier = this.expect(this.getNextToken(), Identifier, "Expecting identifier for this open tag");
    const properties = this.parseAttributes();
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
      return new UniTag(identifier.view, properties);
    }
    this.expect(this.getNextToken(), GreaterThan, "Expecting a closing '>' token for this tag");
    if (identifier.view === "script") return new OpenScriptTag();
    return new OpenTag(identifier.view, properties);
  }

  private parseAttributes() {
    const props = new Array<Attribute>();
    while (this.peekToken() instanceof Identifier) {
      props.push(this.parseAttribute());
    }
    return props;
  }

  @InjectId
  private parseAttribute() {
    const identifier = this.getNextToken() as Identifier;
    let view = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      view = this.expect(this.parseString(), String, "Expecting a string value after '=' token following a tag property").view;
    }
    return new Attribute(identifier.view, view);
  }

  @InjectId
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

  @InjectId
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

  @InjectId
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

  @InjectId
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

  @InjectId
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

  @InjectId
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
    return this.getNextToken();
  }

  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  private expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    const logger = this.logger.get(token.id);
    logger.logError(this.input, message);
    throw new ParseError(message);
  }

  private doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      const logger = this.logger.get(token.id);
      logger.logError(this.input, message);
      throw new ParseError(message);
    }
    return token as T;
  }
}
