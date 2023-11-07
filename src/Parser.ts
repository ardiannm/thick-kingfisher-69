import { Lexer } from "./Lexer";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { RangeNode, CellNode, RowNode, ColumnNode, NumberNode, IdentifierNode, BadNode, BinaryNode, SyntaxNode } from "./SyntaxNode";

const precedence = {
  "+": 1,
  "-": 2,
  "*": 3,
  "/": 4,
};

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

  parseBinary() {
    const terms = new Array<SyntaxNode>();
    const operators = new Array<SyntaxToken>();
    terms.push(this.parseRange());
    while (this.peekToken().repr in precedence) {
      const operator = this.parseToken();
      operators.push(operator);
      const right = this.parseRange();
      terms.push(right);
    }
    console.log(terms, operators);
    return new BadNode(SyntaxKind.NumberNode, "");
  }

  parseRange(): SyntaxNode | RangeNode {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.parseToken();
      const right = this.parseCell();
      return new RangeNode(SyntaxKind.RangeNode, left, right);
    }
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.parseCell();
    return this.parsePrimary();
  }

  parseCell(): CellNode {
    const left = this.parseColumn();
    const right = this.parseRow();
    return new CellNode(SyntaxKind.CellNode, left, right);
  }

  parseRow(): RowNode {
    const repr = this.match(SyntaxKind.NumberToken) ? this.parseToken().repr : "";
    return new RowNode(SyntaxKind.RowNode, repr);
  }

  parseColumn(): ColumnNode {
    const repr = this.match(SyntaxKind.IndentifierToken) ? this.parseToken().repr : "";
    return new ColumnNode(SyntaxKind.ColumnNode, repr);
  }

  parsePrimary(): SyntaxNode {
    const token = this.parseToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new NumberNode(SyntaxKind.NumberNode, token.repr);
      case SyntaxKind.IndentifierToken:
        return new IdentifierNode(SyntaxKind.IndentifierNode, token.repr);
      default:
        return new BadNode(SyntaxKind.BadNode, token.repr);
    }
  }

  parseToken() {
    if (this.tokens.length > 0) return this.tokens.shift();
    return this.tokenizer.getNextToken();
  }
}
