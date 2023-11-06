import { Lexer } from "./Lexer";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

abstract class SyntaxNode {
  constructor(public kind: SyntaxKind) {}
}

class ColumnNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public repr: string) {
    super(kind);
  }
}

class RowNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public repr: string) {
    super(kind);
  }
}

class CellNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public column: ColumnNode, public row: RowNode) {
    super(kind);
  }
}

class RangeNode extends SyntaxNode {
  constructor(public kind: SyntaxKind, public left: CellNode, public right: CellNode) {
    super(kind);
  }
}

export class Parser {
  private tokenizer = new Lexer("");
  constructor(public input: string) {
    this.tokenizer.input = input;
  }

  match(...kinds: Array<SyntaxKind>) {
    const start = this.tokenizer.pointer;
    for (const kind of kinds) {
      if (kind !== this.tokenizer.getNextToken().kind) {
        this.tokenizer.pointer = start;
        return false;
      }
    }
    this.tokenizer.pointer = start;
    return true;
  }

  parse() {
    return this.parseRange();
  }

  parseRange() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.tokenizer.getNextToken();
      const right = this.parseCell();
      return new RangeNode(SyntaxKind.RangeNode, left, right);
    }
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.parseCell();
    return this.tokenizer.getNextToken();
  }

  parseCell() {
    const left = this.parseColumn();
    const right = this.parseRow();
    return new CellNode(SyntaxKind.CellNode, left, right);
  }

  parseRow() {
    const repr = this.match(SyntaxKind.NumberToken) ? this.tokenizer.getNextToken().repr : "";
    return new RowNode(SyntaxKind.RowNode, repr);
  }

  parseColumn() {
    const repr = this.match(SyntaxKind.IndentifierToken) ? this.tokenizer.getNextToken().repr : "";
    return new ColumnNode(SyntaxKind.ColumnNode, repr);
  }
}
