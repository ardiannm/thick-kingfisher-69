import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/Syntax";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeNode, CellNode, RowNode, ColumnNode, NumberNode, IdentifierNode, BadNode, BinaryNode, UnaryNode, ParenthesisNode, ReferenceNode } from "./Syntax/SyntaxNode";

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

  private match(...kinds: Array<SyntaxKind>): boolean {
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

  private expect(kind: SyntaxKind, message?: string) {
    const token = this.getNextToken();
    if (kind === token.kind) return token;
    if (message) this.throwError(message);
    this.throwError(`Expecting '${kind}' but received '${token.kind}'`);
  }

  public parse() {
    try {
      const tree = this.parseReference();
      this.expect(SyntaxKind.EOFToken, "Unexpected tokens found while parsing");
      return tree;
    } catch (error) {
      return error;
    }
  }

  private parseReference() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
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
      return new ReferenceNode(SyntaxKind.ReferenceNode, repr, expression, observing);
    }
    return this.parseExpression();
  }

  private parsePointer() {
    if (this.match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      this.getNextToken();
      this.tokenizer.considerSpace();
      this.getNextToken();
      this.tokenizer.ignoreSpace();
      return new SyntaxToken(SyntaxKind.PointerToken, "->");
    }
    this.throwError(`Expecting a reference pointer token`);
  }

  private operatorPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.StarToken:
      case SyntaxKind.SlashToken:
        return 2;
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
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
      left = new BinaryNode(SyntaxKind.BinaryNode, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression() {
    if (this.match(SyntaxKind.PlusToken) || this.match(SyntaxKind.MinusToken)) {
      const operator = this.getNextToken();
      const right = this.parseUnaryExpression();
      return new UnaryNode(SyntaxKind.UnaryNode, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisNode(SyntaxKind.OpenParenthesisNode, this.getNextToken(), this.parseExpression(), this.expect(SyntaxKind.CloseParenthesisToken, "Expecting a closing parenthesis token"));
    }
    return this.parseRange();
  }

  private parseRange() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.getNextToken();
      if (!(this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken) || this.match(SyntaxKind.IndentifierToken) || this.match(SyntaxKind.NumberToken))) {
        this.throwError("Expecting a valid right side in range reference");
      }
      const right = this.parseCell();
      return new RangeNode(SyntaxKind.RangeNode, left, right);
    }
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.parseCell();
    return this.parsePrimary();
  }

  private parseCell() {
    const left = this.parseColumn();
    const right = this.parseRow();
    const node = new CellNode(SyntaxKind.CellNode, left, right);
    const repr = node.column.repr + node.row.repr;
    this.stack.add(repr);
    return node;
  }

  private parseColumn() {
    const repr = this.match(SyntaxKind.IndentifierToken) ? this.getNextToken().repr : "";
    return new ColumnNode(SyntaxKind.ColumnNode, repr);
  }

  private parseRow() {
    const repr = this.match(SyntaxKind.NumberToken) ? this.getNextToken().repr : "";
    return new RowNode(SyntaxKind.RowNode, repr);
  }

  private parsePrimary() {
    const token = this.getNextToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new NumberNode(SyntaxKind.NumberNode, token.repr);
      case SyntaxKind.IndentifierToken:
        return new IdentifierNode(SyntaxKind.IndentifierNode, token.repr);
      default:
        this.throwError(`Unexpected '${token.kind}' found while parsing`);
        return new BadNode(SyntaxKind.BadNode, token.repr);
    }
  }

  private getNextToken() {
    if (this.tokens.length > 0) return this.tokens.shift();
    return this.tokenizer.getNextToken();
  }
}
