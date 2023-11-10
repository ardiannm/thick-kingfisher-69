import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeReference, CellReference, RowReference, ColumnReference, PrimaryExpression, ExceptionNode, BinaryExpression, UnaryExpression, ParenthesisExpression, ReferenceStatement } from "./Syntax/SyntaxNode";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Parser {
  private lexer = new Lexer("");
  private arr = new Array<SyntaxToken>();
  private defaultInitPeek = 1;
  private peek = this.defaultInitPeek;
  private stack = new Set<string>(); // Using a set to store parsed cell texts

  constructor(public input: string) {
    this.lexer.input = input;
  }

  // Helper method to check if the next token matches the given kinds
  private match(...kinds: Array<SyntaxKind>) {
    this.peek = this.defaultInitPeek;
    for (var kind of kinds) {
      if (kind !== this.peekToken().kind) return false;
      this.peek++;
    }
    this.peek = this.defaultInitPeek;
    return true;
  }

  private peekToken() {
    if (this.peek > this.arr.length) this.arr.push(this.lexer.getNextToken());
    return this.arr[this.peek - 1];
  }

  private parseToken() {
    if (this.arr.length > 0) return this.arr.shift();
    return this.lexer.getNextToken();
  }

  // Main parsing method
  public parse() {
    return this.parseReference();
  }

  private parseReference() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const reference = this.parseCell();
      this.parsePointer();
      this.stack.clear();
      const expression = this.parseExpression();
      const observing = Array.from(this.stack);
      const text = reference.column.text + reference.row.text;
      this.stack.clear();
      return new ReferenceStatement(SyntaxKind.ReferenceStatement, text, expression, observing);
    }
    return this.parseExpression();
  }

  private parsePointer() {
    if (this.match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      this.parseToken();
      this.parseToken();
      return new SyntaxToken(SyntaxKind.PointerToken, "->");
    }
    return this.parseToken();
  }

  private parseExpression(parentPrecedence = 0) {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.operatorPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.parseToken();
      const right = this.parseExpression(precedence);
      left = new BinaryExpression(SyntaxKind.BinaryExpression, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression() {
    if (this.match(SyntaxKind.PlusToken) || this.match(SyntaxKind.MinusToken)) {
      const operator = this.parseToken();
      const right = this.parseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisExpression(SyntaxKind.ParanthesisExpression, this.parseToken(), this.parseExpression(), this.parseToken());
    }
    return this.parseRange();
  }

  private parseRange() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.parseToken();
      const right = this.parseCell();
      return new RangeReference(SyntaxKind.RangeReference, left, right);
    }
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.parseCell();
    return this.parsePrimary();
  }

  private parseCell() {
    const left = this.parseColumn();
    const right = this.parseRow();
    const node = new CellReference(SyntaxKind.CellReference, left, right);
    const text = node.column.text + node.row.text;
    this.stack.add(text);
    return node;
  }

  private parseColumn() {
    const text = this.match(SyntaxKind.IndentifierToken) ? this.parseToken().text : "";
    return new ColumnReference(SyntaxKind.ColumnReference, text);
  }

  private parseRow() {
    const text = this.match(SyntaxKind.NumberToken) ? this.parseToken().text : "";
    return new RowReference(SyntaxKind.RowReference, text);
  }

  private parsePrimary() {
    const token = this.parseToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new PrimaryExpression(SyntaxKind.NumberExpression, token.text);
      case SyntaxKind.IndentifierToken:
        return new PrimaryExpression(SyntaxKind.IndentifierExpression, token.text);
      default:
        return new ExceptionNode(token.kind, token.text);
    }
  }
}
