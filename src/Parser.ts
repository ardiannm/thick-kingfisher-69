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

export class Parser {
  private tokenizer = new Lexer("");
  constructor(public input: string) {
    this.tokenizer.input = input;
  }

  match(kind: SyntaxKind, token?: SyntaxToken) {
    const testToken = token || this.tokenizer.peekToken();
    if (testToken.kind === kind) return true;
    return false;
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
