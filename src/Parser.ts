import { Lexer } from "./Lexer";
import { Syntax } from "./Syntax";
import { SyntaxToken } from "./SyntaxToken";
import { RangeNode, CellNode, RowNode, ColumnNode, NumberNode, IdentifierNode, BadNode, BinaryNode, UnaryNode, ParenthesisNode, ReferenceNode } from "./SyntaxNode";

export class Parser {
  private tokenizer = new Lexer("");
  constructor(public input: string) {
    this.tokenizer.input = input;
  }

  private tokens = new Array<SyntaxToken>();
  private token = 0;
  private stack = new Set<string>();

  private peekToken() {
    if (this.token >= this.tokens.length) this.tokens.push(this.tokenizer.getNextToken());
    return this.tokens[this.token];
  }

  private match(...kinds: Array<Syntax>): boolean {
    const start = this.token;
    for (const kind of kinds) {
      if (kind !== this.peekToken().kind) {
        this.token = start;
        return false;
      }
      this.token = this.token + 1;
    }
    this.token = start;
    return true;
  }

  private throwError(message: string) {
    throw "ParserError: " + message;
  }

  private expect(kind: Syntax, message?: string) {
    const token = this.getNextToken();
    if (kind === token.kind) return token;
    if (message) this.throwError(message);
    this.throwError(`Expecting '${kind}' but received '${token.kind}'`);
  }

  public parse() {
    try {
      const tree = this.parseReference();
      this.expect(Syntax.EOFToken, "Unexpected tokens found while parsing");
      return tree;
    } catch (err) {
      return err;
    }
  }

  private parseReference() {
    if (this.match(Syntax.IndentifierToken, Syntax.NumberToken, Syntax.MinusToken, Syntax.GreaterToken)) {
      const reference = this.parseCell();
      this.parsePointer();
      this.stack.clear();
      const expression = this.parseExpression();
      const observing = Array.from(this.stack);
      const repr = reference.column.repr + reference.row.repr;
      if (this.stack.has(repr)) {
        this.throwError(`Circular dependency for '${repr}'`);
      }
      this.stack.clear();
      return new ReferenceNode(Syntax.ReferenceNode, repr, expression, observing);
    }
    return this.parseExpression();
  }

  private parsePointer() {
    if (this.match(Syntax.MinusToken, Syntax.GreaterToken)) {
      this.getNextToken();
      this.tokenizer.considerSpace();
      this.getNextToken();
      this.tokenizer.ignoreSpace();
      return new SyntaxToken(Syntax.PointerToken, "->");
    }
    this.throwError(`Expecting a reference pointer token`);
  }

  private operatorPrecedence(kind: Syntax) {
    switch (kind) {
      case Syntax.StarToken:
      case Syntax.SlashToken:
        return 2;
      case Syntax.PlusToken:
      case Syntax.MinusToken:
        return 1;
      default:
        return 0;
    }
  }

  private parseExpression(parentPrecedence = 0) {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = this.operatorPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.getNextToken();
      const right = this.parseExpression(precedence);
      left = new BinaryNode(Syntax.BinaryNode, left, operator.repr, right);
    }
    return left;
  }

  private parseUnaryExpression() {
    if (this.match(Syntax.PlusToken) || this.match(Syntax.MinusToken)) {
      const operator = this.getNextToken();
      const right = this.parseUnaryExpression();
      return new UnaryNode(Syntax.UnaryNode, operator.repr, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(Syntax.OpenParenthesisToken)) {
      return new ParenthesisNode(Syntax.OpenParenthesisNode, this.getNextToken(), this.parseExpression(), this.expect(Syntax.CloseParenthesisToken, "Expecting a closing parenthesis token"));
    }
    return this.parseRange();
  }

  private parseRange() {
    if (this.match(Syntax.IndentifierToken, Syntax.NumberToken, Syntax.ColonToken) || this.match(Syntax.IndentifierToken, Syntax.ColonToken) || this.match(Syntax.IndentifierToken, Syntax.ColonToken)) {
      const left = this.parseCell();
      this.getNextToken();
      const right = this.parseCell();
      return new RangeNode(Syntax.RangeNode, left, right);
    }
    if (this.match(Syntax.IndentifierToken, Syntax.NumberToken)) return this.parseCell();
    return this.parsePrimary();
  }

  private parseCell() {
    const left = this.parseColumn();
    const right = this.parseRow();
    const node = new CellNode(Syntax.CellNode, left, right);
    const repr = node.column.repr + node.row.repr;
    this.stack.add(repr);
    return node;
  }

  private parseColumn() {
    const repr = this.match(Syntax.IndentifierToken) ? this.getNextToken().repr : "";
    return new ColumnNode(Syntax.ColumnNode, repr);
  }

  private parseRow() {
    const repr = this.match(Syntax.NumberToken) ? this.getNextToken().repr : "";
    return new RowNode(Syntax.RowNode, repr);
  }

  private parsePrimary() {
    const token = this.getNextToken();
    switch (token.kind) {
      case Syntax.NumberToken:
        return new NumberNode(Syntax.NumberNode, token.repr);
      case Syntax.IndentifierToken:
        return new IdentifierNode(Syntax.IndentifierNode, token.repr);
      default:
        // this.throwError(`Unexpected '${token.repr}' found while parsing`);
        return new BadNode(Syntax.BadNode, token.repr);
    }
  }

  private getNextToken() {
    if (this.tokens.length > 0) return this.tokens.shift();
    return this.tokenizer.getNextToken();
  }
}
