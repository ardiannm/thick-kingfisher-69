import Program from "./tokens/expressions/Program";
import Expression from "./tokens/expressions/Expression";
import Slash from "./tokens/operators/Slash";
import Power from "./tokens/operators/Power";
import Identifier from "./tokens/expressions/Identifier";
import GreaterThan from "./tokens/basic/GreaterThan";
import BackSlash from "./tokens/basic/BackSlash";
import StandaloneComponent from "./tokens/html/StandaloneComponent";
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
import Identity from "./tokens/expressions/Identity";
import Negation from "./tokens/expressions/Negation";
import Division from "./tokens/expressions/Division";
import Addition from "./tokens/expressions/Addition";
import Multiplication from "./tokens/expressions/Multiplication";
import Exponentiation from "./tokens/expressions/Exponentiation";
import String from "./tokens/expressions/String";
import Parenthesis from "./tokens/expressions/Parenthesis";
import CloseTag from "./tokens/html/CloseTag";
import LessThan from "./tokens/basic/LessThan";
import OpenScriptTag from "./tokens/html/OpenScriptTag";
import CloseScriptTag from "./tokens/html/CloseScriptTag";
import Script from "./tokens/html/Script";
import HTMLElement from "./tokens/html/HTMLElement";
import Component from "./tokens/html/Component";
import Service from "./utils/Service";
import ExclamationMark from "./tokens/basic/ExclamationMark";
import Comment from "./tokens/html/Comment";
import TextContent from "./tokens/html/TextContent";
import Number from "./tokens/expressions/Number";
import Inject from "./utils/Inject";

const AmbiguosTags = ["link", "br", "input", "img", "hr", "meta", "col", "textarea"];

export default class Parser extends Service {
  //

  public parse() {
    try {
      const program = this.parseProgram();
      const format = JSON.stringify(program, undefined, 3);
      console.log(format);
      return program;
    } catch (logger) {
      const format = logger.join("\n");
      console.log(format);
      return logger;
    }
  }

  @Inject
  private parseProgram() {
    this.doNotExpect(this.peekToken(), EOF, "source file is empty");
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      expressions.push(this.parseExpressions());
    }
    return new Program(expressions);
  }

  @Inject
  private parseExpressions() {
    if (this.peekToken() instanceof LessThan) return this.parseComponent();
    return this.parseTerm();
  }

  @Inject
  private parseComponent() {
    const left = this.parseContent();
    if (left instanceof OpenTag) {
      const children = new Array<Component>();
      while (this.hasMoreTokens()) {
        const right = this.parseComponent();
        if (right instanceof CloseTag) {
          if (right.tag !== left.tag) {
            this.throwError(`unmatching \`${right.tag}\` found for the \`${left.tag}\` tag`);
          }
          return new HTMLElement(left.tag, children);
        }
        const component = this.expect(right, Component, "token is not a valid html component");
        if (component instanceof TextContent) {
          if (/^\s+$/.test(component.view)) continue;
        }
        children.push(component);
      }
      this.throwError(`expecting a closing token for \`${left.tag}\` tag`);
    }
    return left;
  }

  @Inject
  private parseContent() {
    let view = "";
    this.considerSpace();
    if (this.peekToken() instanceof LessThan) {
      this.ignoreSpace();
      return this.parseScript();
    }
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof LessThan) break;
      view += this.getNext();
    }
    this.ignoreSpace();
    return new TextContent(view);
  }

  @Inject
  private parseScript() {
    const left = this.parseTag();
    if (left instanceof OpenScriptTag) {
      const content = this.parseContent();
      try {
        const right = this.parseTag();
        if (!(right instanceof CloseScriptTag)) throw right;
        return new Script(content.view);
      } catch (right) {
        this.throwError(`expecting a closing \`script\` tag`);
      }
    }
    return left;
  }

  @Inject
  private parseTag() {
    const left = this.parseComment();
    if (left instanceof Comment) return left;
    if (this.peekToken() instanceof Slash) {
      this.getNextToken();
      const identifier = this.expect(this.parseTagIdentifier(), Identifier, "expecting identifier for closing tag");
      this.expect(this.getNextToken(), GreaterThan, "expecting `>` for closing tag");
      if (identifier.view === "script") return new CloseScriptTag();
      return new CloseTag(identifier.view);
    }
    const identifier = this.expect(this.parseTagIdentifier(), Identifier, "expecting identifier for open tag");
    const attributes = new Array<Attribute>();
    while (this.peekToken() instanceof Identifier) {
      attributes.push(this.parseAttribute());
    }
    if (this.peekToken() instanceof Slash) {
      const token = this.getNextToken() as Character;
      this.expect(this.getNextToken(), GreaterThan, `expecting closing token \`>\` but received \`${token.view}\` after tag name identifier \`${identifier.view}\``);
      return new StandaloneComponent(identifier.view, attributes);
    }
    this.expect(this.getNextToken(), GreaterThan, "expecting `>` for tag");
    if (identifier.view === "script") return new OpenScriptTag();
    if (AmbiguosTags.includes(identifier.view)) return new StandaloneComponent(identifier.view, attributes);
    return new OpenTag(identifier.view, attributes);
  }

  @Inject
  private parseComment() {
    const left = this.expect(this.getNextToken(), LessThan, "expecting `<` for an html tag");
    if (this.peekToken() instanceof ExclamationMark) {
      this.expect(this.getNextToken(), ExclamationMark, "expecting `!` for a comment");
      const message = "expecting `--` after `!` for a comment";
      this.expect(this.getNextToken(), Minus, message);
      this.expect(this.getNextToken(), Minus, message);
      let view = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Minus) {
          const keep = this.pointer;
          this.getNextToken();
          const token = this.peekToken();
          this.doNotExpect(token, GreaterThan, "expecting `--` before `>` for a comment");
          if (token instanceof Minus) {
            this.getNextToken();
            this.expect(this.getNextToken(), GreaterThan, "expecting `>` for comment");
            return new Comment(view);
          }
          this.pointer = keep;
        }
        view += this.getNext();
      }
      this.throwError("unexpected end of comment");
    }
    return left;
  }

  @Inject
  private parseTagIdentifier() {
    const identifier = this.expect(this.getNextToken(), Identifier, "expecting leading identifier for html tag name");
    let view = identifier.view;
    this.considerSpace();
    while (this.peekToken() instanceof Identifier || this.peekToken() instanceof Minus || this.peekToken() instanceof Number) {
      const token = this.getNextToken() as Identifier | Minus | Number;
      if (token instanceof Minus && !(this.peekToken() instanceof Identifier) && !(this.peekToken() instanceof Number)) {
        this.throwError("expecting an ending number or identifier for the name tag");
      }
      view += token.view;
    }
    this.ignoreSpace();
    return new Identifier(view);
  }

  @Inject
  private parseAttribute() {
    const identifier = this.getNextToken() as Identifier;
    let view = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      view = this.expect(this.parseString(), String, "expecting a string value after `=` following a tag property").view;
    }
    return new Attribute(identifier.view, view);
  }

  @Inject
  private parseTerm() {
    const left = this.parseFactor();
    if (this.peekToken() instanceof Plus) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseTerm(), Expression, "invalid right hand side in binary expression");
      return new Addition(left, right);
    }
    if (this.peekToken() instanceof Minus) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseTerm(), Expression, "invalid right hand side in binary expression");
      return new Substraction(left, right);
    }
    return left;
  }

  @Inject
  private parseFactor() {
    const left = this.parseExponent();
    if (this.peekToken() instanceof Product) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseFactor(), Expression, "invalid right hand side in binary expression");
      return new Multiplication(left, right);
    }
    if (this.peekToken() instanceof Slash) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseFactor(), Expression, "invalid right hand side in binary expression");
      return new Division(left, right);
    }
    return left;
  }

  @Inject
  private parseExponent() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      this.getNextToken();
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseExponent(), Expression, "invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  }

  @Inject
  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of unary expression");
      const right = this.expect(this.parseUnary(), Expression, "invalid expression in unary expression");
      if (operator instanceof Plus) return new Identity(right);
      return new Negation(right);
    }
    return this.parseParanthesis();
  }

  @Inject
  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      this.doNotExpect(this.peekToken(), CloseParenthesis, "parenthesis closed with no expression");
      const expression = this.expect(this.parseTerm(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), CloseParenthesis, "expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return this.parseString();
  }

  @Inject
  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.getNextToken();
      let view = "";
      this.considerSpace();
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof Quote) break;
        if (token instanceof BackSlash) this.getNextToken();
        view += (this.getNextToken() as Character).view;
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      return new String(view);
    }
    return this.getNextToken();
  }
}
