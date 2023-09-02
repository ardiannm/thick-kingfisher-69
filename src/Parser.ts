import Program from "./tokens/expressions/Program";
import Expression from "./tokens/expressions/Expression";
import Slash from "./tokens/operators/Slash";
import Power from "./tokens/operators/Power";
import Identifier from "./tokens/expressions/Identifier";
import GreaterThan from "./tokens/basic/GreaterThan";
import BackSlash from "./tokens/basic/BackSlash";
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
import LessThan from "./tokens/basic/LessThan";
import OpenScriptTag from "./tokens/html/OpenScriptTag";
import CloseScriptTag from "./tokens/html/CloseScriptTag";
import Script from "./tokens/html/Script";
import HTMLElement from "./tokens/html/HTMLElement";
import Component from "./tokens/html/Component";
import Service from "./utils/Service";
import ExclamationMark from "./tokens/basic/ExclamationMark";
import Comment from "./tokens/html/Comment";

export default class Parser extends Service {
  //

  public parse() {
    try {
      const program = this.parseProgram();
      console.log(JSON.stringify(program, undefined, 3));
      return program;
    } catch (error) {
      return error;
    }
  }

  @InjectId
  private parseProgram() {
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
          if (right.tagName !== left.tag) {
            this.expect(right, EOF, `unmatching \`${right.tagName}\` found for the \`${left.tag}\` open tag`);
          }
          return new HTMLElement(left.tag, children);
        }
        const component = this.expect(right, Component, "token is not a valid html component");
        children.push(component);
      }
      this.throw(`expecting a closing token for \`${left.tag}\` tag`);
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
        this.expect(this.parseTag(), CloseScriptTag, `expecting a closing \`${left.tag}\` tag`);
        return new Script(view);
      } catch {
        this.throw(`expecting a closing \`${left.tag}\` tag`);
      }
    }
    return left;
  }

  @InjectId
  private parseTag() {
    this.expect(this.getNextToken(), LessThan, "expecting token `<` for an html tag");
    if (this.peekToken() instanceof ExclamationMark) {
      return this.parseComment();
    }
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      const identifier = this.expect(this.getNextToken(), Identifier, "expecting identifier for closing tag");
      this.expect(this.getNextToken(), GreaterThan, "expecting token `>` for closing tag");
      if (identifier.view === "script") return new CloseScriptTag();
      return new CloseTag(identifier.view);
    }
    const identifier = this.expect(this.getNextToken(), Identifier, "expecting identifier for open tag");
    const properties = new Array<Attribute>();
    while (this.peekToken() instanceof Identifier) {
      properties.push(this.parseAttribute());
    }
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      this.expect(this.getNextToken(), GreaterThan, "expecting token `>` token for tag");
      return new UniTag(identifier.view, properties);
    }
    this.expect(this.getNextToken(), GreaterThan, "expecting token `>` for tag");
    if (identifier.view === "script") return new OpenScriptTag();
    return new OpenTag(identifier.view, properties);
  }

  @InjectId
  private parseComment() {
    this.expect(this.getNextToken(), ExclamationMark, "expecting `!` for a comment");
    const message = "expecting two consecutive `--` after `!` for a comment";
    this.expect(this.getNextToken(), Minus, message);
    this.expect(this.getNextToken(), Minus, message);
    let view = "";
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof Minus) {
        const keep = this.pointer;
        this.getNextToken();
        const token = this.peekToken();
        this.doNotExpect(token, GreaterThan, "expecting two consecutive `--` before `>` for a comment");
        if (token instanceof Minus) {
          this.getNextToken();
          this.expect(this.getNextToken(), GreaterThan, "expecting token `>` for comment");
          return new Comment(view);
        }
        this.pointer = keep;
      }
      view += this.getNext();
    }
    this.throw("unexpected end of comment");
  }

  @InjectId
  private parseAttribute() {
    const identifier = this.getNextToken() as Identifier;
    let view = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      view = this.expect(this.parseString(), String, "expecting a string value after `=` token following a tag property").view;
    }
    return new Attribute(identifier.view, view);
  }

  @InjectId
  private parseAddition() {
    const left = this.parseMultiplication();
    if (this.peekToken() instanceof Plus) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseAddition(), Expression, "invalid right hand side in binary expression");
      return new Addition(left, right);
    }
    if (this.peekToken() instanceof Minus) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseAddition(), Expression, "invalid right hand side in binary expression");
      return new Substraction(left, right);
    }
    return left;
  }

  @InjectId
  private parseMultiplication() {
    const left = this.parsePower();
    if (this.peekToken() instanceof Product) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseMultiplication(), Expression, "invalid right hand side in binary expression");
      return new Multiplication(left, right);
    }
    if (this.peekToken() instanceof Slash) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseMultiplication(), Expression, "invalid right hand side in binary expression");
      return new Division(left, right);
    }
    return left;
  }

  @InjectId
  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      this.getNextToken();
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parsePower(), Expression, "invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  }

  @InjectId
  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of unary expression");
      const right = this.expect(this.parseUnary(), Expression, "invalid expression in unary expression");
      if (operator instanceof Plus) return new Positive(right);
      return new Negative(right);
    }
    return this.parseParanthesis();
  }

  @InjectId
  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      this.doNotExpect(this.peekToken(), CloseParenthesis, "parenthesis closed with no expression");
      const expression = this.expect(this.parseAddition(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), CloseParenthesis, "expecting to close this parenthesis");
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
        const token = this.peekToken();
        if (token instanceof Quote) break;
        if (token instanceof BackSlash) {
          this.getNextToken();
        }
        view += (this.getNextToken() as Character).view;
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      return new String(view);
    }
    return this.getNextToken();
  }
}
