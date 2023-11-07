import { Lexer } from "./Lexer";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { RangeNode, CellNode, RowNode, ColumnNode, NumberNode, IdentifierNode, BadNode, BinaryNode, SyntaxNode } from "./SyntaxNode";

export class Parser {
  private tokenizer = new Lexer("");
  constructor(public input: string) {
    this.tokenizer.input = input;
  }

  private tokens = new Array<SyntaxToken>();
  private pointer = 0;

  peekToken() {
    if (this.pointer >= this.tokens.length) this.tokens.push(this.tokenizer.getNextToken());
    return this.tokens[this.pointer];
  }

  match(...kinds: Array<SyntaxKind>): boolean {
    const start = this.pointer;
    for (const kind of kinds) {
      if (this.pointer >= this.tokens.length) this.tokens.push(this.tokenizer.getNextToken());
      if (kind !== this.peekToken().kind) {
        this.pointer = start;
        return false;
      }
      this.pointer = this.pointer + 1;
    }
    this.pointer = start;
    return true;
  }

  parse() {
    return this.parseBinary();
  }

  operatorPrecedence(kind: SyntaxKind) {
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

  parseBinary(parentPrecedence = 0) {
    let left = this.parseRange();
    while (true) {
      const precedence = this.operatorPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.getNextToken();
      const right = this.parseBinary(precedence);
      left = new BinaryNode(SyntaxKind.BinaryNode, left, operator.repr, right);
    }
    return left;
  }

  parseRange() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.getNextToken();
      const right = this.parseCell();
      return new RangeNode(SyntaxKind.RangeNode, left, right);
    }
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.parseCell();
    return this.parsePrimary();
  }

  parseCell() {
    const left = this.parseColumn();
    const right = this.parseRow();
    return new CellNode(SyntaxKind.CellNode, left, right);
  }

  parseRow() {
    const repr = this.match(SyntaxKind.NumberToken) ? this.getNextToken().repr : "";
    return new RowNode(SyntaxKind.RowNode, repr);
  }

  parseColumn() {
    const repr = this.match(SyntaxKind.IndentifierToken) ? this.getNextToken().repr : "";
    return new ColumnNode(SyntaxKind.ColumnNode, repr);
  }

  parsePrimary(): SyntaxNode {
    const token = this.getNextToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new NumberNode(SyntaxKind.NumberNode, token.repr);
      case SyntaxKind.IndentifierToken:
        return new IdentifierNode(SyntaxKind.IndentifierNode, token.repr);
      default:
        return new BadNode(SyntaxKind.BadNode, token.repr);
    }
  }

  getNextToken() {
    if (this.tokens.length > 0) return this.tokens.shift();
    return this.tokenizer.getNextToken();
  }
}
