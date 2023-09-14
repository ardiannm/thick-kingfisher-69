import Program from "./ast/expressions/Program";
import Expression from "./ast/expressions/Expression";
import Slash from "./ast/operators/Slash";
import Power from "./ast/operators/Power";
import Identifier from "./ast/expressions/Identifier";
import GreaterThan from "./ast/tokens/GreaterThan";
import SelfClosingHTMLElement from "./ast/html/SelfClosingHTMLElement";
import HTMLVoidElement from "./ast/html/HTMLVoidElement";
import Equals from "./ast/tokens/Equals";
import Minus from "./ast/operators/Minus";
import EOF from "./ast/tokens/EOF";
import OpenTag from "./ast/html/OpenTag";
import Attribute from "./ast/html/Attribute";
import Plus from "./ast/operators/Plus";
import Product from "./ast/operators/Product";
import OpenParenthesis from "./ast/tokens/OpenParenthesis";
import CloseParenthesis from "./ast/tokens/CloseParenthesis";
import Character from "./ast/tokens/Character";
import Quote from "./ast/tokens/Quote";
import Substraction from "./ast/expressions/Substraction";
import Identity from "./ast/expressions/Identity";
import Negation from "./ast/expressions/Negation";
import Division from "./ast/expressions/Division";
import Addition from "./ast/expressions/Addition";
import Multiplication from "./ast/expressions/Multiplication";
import Exponentiation from "./ast/expressions/Exponentiation";
import String from "./ast/expressions/String";
import Parenthesis from "./ast/expressions/Parenthesis";
import CloseTag from "./ast/html/CloseTag";
import LessThan from "./ast/tokens/LessThan";
import OpenScriptTag from "./ast/html/OpenScriptTag";
import CloseScriptTag from "./ast/html/CloseScriptTag";
import HTMLScript from "./ast/html/HTMLScript";
import HTMLElement from "./ast/html/HTMLElement";
import HTMLComponent from "./ast/html/HTMLComponent";
import ParserService from "./services/ParserService";
import ExclamationMark from "./ast/tokens/ExclamationMark";
import HTMLComment from "./ast/html/HTMLComment";
import HTMLTextContent from "./ast/html/HTMLTextContent";
import Number from "./ast/expressions/Number";
import Interpolation from "./ast/expressions/Interpolation";
import OpenBrace from "./ast/tokens/OpenBrace";
import CloseBrace from "./ast/tokens/CloseBrace";
import Cell from "./ast/spreadsheet/Cell";
import Colon from "./ast/tokens/Colon";
import Range from "./ast/spreadsheet/Range";
import BadToken from "./ast/tokens/BadToken";
import Dot from "./ast/tokens/Dot";
import SemiColon from "./ast/tokens/SemiColon";
import Import from "./ast/expressions/Import";
import ImportFile from "./services/ImportFile";
import HTML from "./ast/html/HTML";
import Binary from "./ast/expressions/Binary";

const HTMLVoidElements = ["br", "hr", "img", "input", "link", "base", "meta", "param", "area", "embed", "col", "track", "source"];

export default class Parser extends ParserService {
  //

  protected nameSpace: string;

  constructor(public input: string, public path: string) {
    super(input, path);
    const nameSpaces = path.replace(/.txt$/, "").split("/");
    let lastNameSpace = nameSpaces[nameSpaces.length - 1];
    this.nameSpace = lastNameSpace;
  }

  public parse() {
    this.doNotExpect(this.peekToken(), EOF, "source file is empty");
    if (this.matchKeyword("DOCTYPE")) {
      const tree = this.parseHTMLComponent();
      if (this.hasMoreTokens()) this.throwError(`only a single \`HTMLComponent\` per file is allowed`);
      return tree;
    }
    if (this.matchKeyword("Spreadsheet")) {
      const tree = this.parseSpreadsheet();
      if (this.hasMoreTokens()) this.throwError(`only a single \`HTMLComponent\` per file is allowed`);
      return tree;
    }
    return this.parseProgram();
  }

  private parseSpreadsheet() {
    return this.parseRange();
  }

  private parseRange() {
    let left = this.parseCell();
    const parsableCell = left instanceof Cell || left instanceof Identifier || left instanceof Number;
    if (parsableCell) {
      this.considerSpace();
      if (this.peekToken() instanceof Colon) {
        this.getNextToken();
        if (!parsableCell) {
          this.throwError(`invalid left hand side for range expression`);
        }
        if (left instanceof Number) left = new Cell("", left.view);
        if (left instanceof Identifier) left = new Cell(left.view, "");
        this.trackPosition();
        let right = this.parseCell();
        this.doNotExpect(right, EOF, "oops! missing the right hand side for range expression");
        if (!(right instanceof Cell || right instanceof Identifier || right instanceof Number)) {
          this.throwError(`expecting a valid spreadsheet reference right after \`:\``);
        }
        if (right instanceof Number) right = new Cell("", right.view);
        if (right instanceof Identifier) right = new Cell(right.view, "");
        this.ignoreSpace();
        const view = left.column + left.row + ":" + right.column + right.row;
        const errorMessage = `\`${view}\` is not a valid range reference; did you mean \`${view.toUpperCase()}\`?`;
        if (left.column !== left.column.toUpperCase()) this.throwError(errorMessage);
        if (right.column !== right.column.toUpperCase()) this.throwError(errorMessage);
        return new Range(left, right);
      }
      this.ignoreSpace();
    }
    return left;
  }

  private parseCell() {
    const left = this.parseString() as Identifier | Number;
    if (left instanceof Identifier) {
      this.considerSpace();
      if (this.peekToken() instanceof Number) {
        const right = this.parseToken() as Number;
        this.ignoreSpace();
        const view = left.view + right.view;
        const errorMessage = `\`${view}\` is not a valid cell reference; did you mean \`${view.toUpperCase()}\`?`;
        if (left.view !== left.view.toUpperCase()) this.throwError(errorMessage);
        return new Cell(left.view, right.view);
      }
      this.ignoreSpace();
    }
    return left;
  }

  private parseProgram() {
    let expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      const expression = this.parseImport();
      if (!(expression instanceof Import || expression instanceof Binary)) {
        this.throwError(`import statements or binary expression allowed only; matched \`${expression.type}\``);
      }
      expressions.push(expression);
    }
    return new Program(expressions);
  }

  private parseImport() {
    if (this.matchKeyword("import")) {
      const errorMessage = "expecting a namespace identifier for module import";
      const token = this.expect(this.getNextToken(), Identifier, errorMessage);
      let nameSpace = token.view;
      while (this.peekToken() instanceof Dot) {
        const token = this.getNextToken() as Character;
        nameSpace += token.view + this.expect(this.getNextToken(), Identifier, errorMessage).view;
      }
      this.trackPosition();
      this.expect(this.getNextToken(), SemiColon, "semicolon `;` expected after an import statement");
      const path = nameSpace.replace(/\./g, "/") + ".txt";
      let sourceCode = "";
      let namesSpaces = nameSpace.split(".");
      let lastNameSpace = namesSpaces[namesSpaces.length - 1];
      try {
        sourceCode = ImportFile(path);
      } catch (error) {
        this.throwError(`namespace \`${lastNameSpace}\` does not exist`);
      }
      try {
        const program = new Parser(sourceCode, path).parseProgram();
        return new Import(nameSpace, program);
      } catch (error) {
        console.log(error);
        this.throwError(`internal error found in \`${lastNameSpace}\` module with file path \`./${path}\``);
      }
    }
    return this.parseTerm();
  }

  private parseHTMLComponent(): HTML {
    const left = this.parseHTMLTextContent();
    if (left instanceof OpenTag) {
      if (HTMLVoidElements.includes(left.tag)) {
        return new HTMLVoidElement(left.tag, left.attributes);
      }
      const children = new Array<HTMLComponent>();
      while (this.hasMoreTokens()) {
        const right = this.parseHTMLComponent();
        if (right instanceof CloseTag) {
          if (left.tag !== right.tag) {
            this.throwError(`\`${right.tag}\` is not a match for \`${left.tag}\` tag`);
          }
          return new HTMLElement(left.tag, left.attributes, children);
        }
        this.expect(right, HTMLComponent, `\`${right.type}\` is not a valid \`HTMLComponent\``);
        children.push(right);
      }
      this.throwError(`expecting a closing \`${left.tag}\` tag`);
    }
    return left;
  }

  private parseHTMLTextContent() {
    let view = "";
    this.considerSpace();
    if (this.peekToken() instanceof LessThan) {
      this.ignoreSpace();
      return this.parseHTMLScript();
    }
    while (this.hasMoreTokens()) {
      if (this.peekToken() instanceof LessThan) break;
      view += this.getNext();
    }
    this.ignoreSpace();
    if (/^\s+$/.test(view)) {
      return this.parseHTMLTextContent();
    }
    return new HTMLTextContent(view);
  }

  private parseHTMLScript() {
    const left = this.parseTag();
    if (left instanceof OpenScriptTag) {
      let view = "";
      while (this.hasMoreTokens()) {
        this.considerSpace();
        if (this.peekToken() instanceof LessThan) {
          const from = this.pointer;
          try {
            const tag = this.parseTag();
            if (tag instanceof CloseScriptTag) {
              this.ignoreSpace();
              return new HTMLScript(view);
            }
          } catch {
            view += this.input.substring(from, this.pointer);
          }
        }
        const token = this.getNextToken() as Character;
        view += token.view;
      }
      this.throwError(`expecting a closing script tag`);
    }
    return left;
  }

  private parseTag() {
    const left = this.parseHTMLComment();
    if (left instanceof HTMLComment) return left;
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
      this.expect(this.getNextToken(), GreaterThan, `expecting closing token \`>\` but matched \`${token.view}\` after tag name identifier \`${identifier.view}\``);
      return new SelfClosingHTMLElement(identifier.view, attributes);
    }
    const token = this.getNextToken() as Character;
    this.expect(token, GreaterThan, `expecting a closing \`>\` for \`${identifier.view}\` open tag but matched \`${token.view}\` character`);
    if (identifier.view === "script") return new OpenScriptTag();
    return new OpenTag(identifier.view, attributes);
  }

  private parseHTMLComment() {
    const left = this.expect(this.getNextToken(), LessThan, "expecting `<` for an html tag");
    if (this.peekToken() instanceof ExclamationMark) {
      this.trackPosition();
      this.expect(this.getNextToken(), ExclamationMark, "expecting `!` for a comment");
      const errorMessage = "expecting `--` after `!` for a comment";
      this.expect(this.getNextToken(), Minus, errorMessage);
      this.expect(this.getNextToken(), Minus, errorMessage);
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
            return new HTMLComment(view);
          }
          this.pointer = keep;
        }
        view += this.getNext();
      }
      this.throwError("unexpected end of comment");
    }
    return left;
  }

  private parseTagIdentifier() {
    const left = this.getNextToken() as Character;
    const identifier = this.expect(left, Identifier, `expecting an identifier but matched \`${left.view}\` for tag name`);
    let view = identifier.view;
    this.considerSpace();
    while (this.peekToken() instanceof Identifier || this.peekToken() instanceof Minus || this.peekToken() instanceof Number) {
      const right = this.getNextToken() as Identifier | Minus | Number;
      if (right instanceof Minus && !(this.peekToken() instanceof Identifier) && !(this.peekToken() instanceof Number)) {
        this.throwError("expecting an ending number or identifier for the name tag");
      }
      view += right.view;
    }
    this.ignoreSpace();
    return new Identifier(view);
  }

  private parseAttribute() {
    let property = "";
    if (this.peekToken() instanceof Identifier) {
      property += (this.getNextToken() as Character).view;
    }
    this.considerSpace();
    while (this.peekToken() instanceof Identifier || this.peekToken() instanceof Minus || this.peekToken() instanceof Number || this.peekToken() instanceof Colon) {
      property += (this.getNextToken() as Character).view;
    }
    this.ignoreSpace();
    let value = "";
    if (this.peekToken() instanceof Equals) {
      this.getNextToken();
      const token = this.peekToken() as Character;
      value = this.expect(this.parseString(), String, `expecting a string value after \`=\` following a tag property but matched \`${token.view}\``).view;
    }
    return new Attribute(property, value);
  }

  private parseTerm() {
    const left = this.parseFactor();
    const token = this.peekToken();
    if (token instanceof Plus || token instanceof Minus) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.trackPosition();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseTerm(), Expression, "invalid right hand side in binary expression");
      if (token instanceof Plus) return new Addition(left, right);
      return new Substraction(left, right);
    }
    return left;
  }

  private parseFactor() {
    const left = this.parseExponent();
    const token = this.peekToken();
    if (token instanceof Product || token instanceof Slash) {
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.getNextToken();
      this.trackPosition();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseFactor(), Expression, "invalid right hand side in binary expression");
      if (token instanceof Product) return new Multiplication(left, right);
      return new Division(left, right);
    }
    return left;
  }

  private parseExponent() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      this.getNextToken();
      this.expect(left, Expression, "invalid left hand side in binary expression");
      this.trackPosition();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of binary expression");
      const right = this.expect(this.parseExponent(), Expression, "invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken();
      this.doNotExpect(this.peekToken(), EOF, "unexpected end of unary expression");
      this.trackPosition();
      const right = this.expect(this.parseUnary(), Expression, "invalid expression in unary expression");
      if (operator instanceof Plus) return new Identity(right);
      return new Negation(right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      this.doNotExpect(this.peekToken(), CloseParenthesis, "parenthesis closed with no expression");
      const expression = this.expect(this.parseTerm(), Expression, "expecting expression after an open parenthesis");
      this.expect(this.getNextToken(), CloseParenthesis, "expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      this.getNextToken();
      let view = "";
      this.considerSpace();
      const terms = new Array<Expression>();
      while (this.hasMoreTokens()) {
        const token = this.peekToken();
        if (token instanceof Quote) break;
        if (token instanceof OpenBrace) {
          if (view) {
            terms.push(new String(view));
            view = "";
          }
          const interpolation = this.parseInterpolation();
          terms.push(interpolation);
          continue;
        }
        const character = this.getNextToken() as Character;
        view += character.view;
      }
      this.expect(this.getNextToken(), Quote, "expecting a closing quote for the string");
      this.ignoreSpace();
      if (view) terms.push(new String(view));
      if (terms.length > 1) return new Interpolation(terms);
      return new String(view);
    }
    return this.parseToken();
  }

  private parseInterpolation() {
    this.ignoreSpace();
    this.expect(this.getNextToken(), OpenBrace, "expecting '{' for string interpolation");
    const expression = this.parseTerm();
    this.expect(this.getNextToken(), CloseBrace, "expecting '}' for string interpolation");
    this.considerSpace();
    return expression;
  }

  private parseToken() {
    const token = this.getNextToken();
    if (token instanceof BadToken) this.throwError(`bad input character \`${token.view}\` found`);
    return token;
  }
}
