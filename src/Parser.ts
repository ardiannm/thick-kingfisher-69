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

  match(kind: SyntaxKind, token?: SyntaxToken | SyntaxNode) {
    const testToken = token || this.tokenizer.peekToken();
    if (testToken.kind === kind) return true;
    return false;
  }

  parse() {
    return this.parseRange();
  }

  parseRange() {
    let left = this.parseCell();
    if (this.match(SyntaxKind.ColonToken)) {
      this.tokenizer.getNextToken();
      if (this.match(SyntaxKind.IndentifierToken, left)) {
        left = new CellNode(SyntaxKind.ColumnNode, new ColumnNode(SyntaxKind.ColumnNode, (left as SyntaxToken).repr), new RowNode(SyntaxKind.RowNode, ""));
      }
      if (this.match(SyntaxKind.NumberToken, left)) {
        left = new CellNode(SyntaxKind.ColumnNode, new ColumnNode(SyntaxKind.ColumnNode, ""), new RowNode(SyntaxKind.RowNode, (left as SyntaxToken).repr));
      }
      let right = this.parseCell();
      if (this.match(SyntaxKind.IndentifierToken, right)) {
        right = new CellNode(SyntaxKind.CellNode, new ColumnNode(SyntaxKind.ColumnNode, (right as SyntaxToken).repr), new RowNode(SyntaxKind.RowNode, ""));
      }
      if (this.match(SyntaxKind.NumberToken, right)) {
        right = new CellNode(SyntaxKind.ColumnNode, new ColumnNode(SyntaxKind.ColumnNode, ""), new RowNode(SyntaxKind.RowNode, (right as SyntaxToken).repr));
      }
      return new RangeNode(SyntaxKind.RangeNode, left as CellNode, right as CellNode);
    }
    return left;
  }

  parseCell() {
    const left = this.tokenizer.getNextToken();
    if (this.match(SyntaxKind.IndentifierToken, left) && this.match(SyntaxKind.NumberToken)) {
      const right = this.tokenizer.getNextToken();
      return new CellNode(SyntaxKind.CellNode, new ColumnNode(SyntaxKind.RowNode, left.repr), new RowNode(SyntaxKind.ColumnNode, right.repr));
    }
    return left;
  }
}
