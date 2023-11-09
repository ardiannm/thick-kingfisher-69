import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeReference, CellReference, RowReference, ColumnReference, PrimaryExpression, ExceptionNode, BinaryExpression, UnaryExpression, ParenthesisExpression, ReferenceStatement } from "./Syntax/SyntaxNode";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

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

  public parse() {
    try {
      const tree = this.parseReference();
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
      const text = reference.column.text + reference.row.text;
      this.stack.clear();
      return new ReferenceStatement(SyntaxKind.ReferenceStatement, text, expression, observing);
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
    return this.getNextToken();
  }

  private parseExpression(parentPrecedence = 0) {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.operatorPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.getNextToken();
      const right = this.parseExpression(precedence);
      left = new BinaryExpression(SyntaxKind.BinaryExpression, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression() {
    if (this.match(SyntaxKind.PlusToken) || this.match(SyntaxKind.MinusToken)) {
      const operator = this.getNextToken();
      const right = this.parseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisExpression(SyntaxKind.ParanthesisExpression, this.getNextToken(), this.parseExpression(), this.getNextToken());
    }
    return this.parseRange();
  }

  private parseRange() {
    if (this.match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.parseCell();
      this.tokenizer.considerSpace();
      this.getNextToken();
      const right = this.parseCell();
      this.tokenizer.ignoreSpace();
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
    const text = this.match(SyntaxKind.IndentifierToken) ? this.getNextToken().text : "";
    return new ColumnReference(SyntaxKind.ColumnReference, text);
  }

  private parseRow() {
    const text = this.match(SyntaxKind.NumberToken) ? this.getNextToken().text : "";
    return new RowReference(SyntaxKind.RowReference, text);
  }

  private parsePrimary() {
    const token = this.getNextToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new PrimaryExpression(SyntaxKind.NumberExpression, token.text);
      case SyntaxKind.IndentifierToken:
        return new PrimaryExpression(SyntaxKind.IndentifierExpression, token.text);
      default:
        return new ExceptionNode(token.kind, token.text);
    }
  }

  private getNextToken() {
    if (this.tokens.length > 0) return this.tokens.shift();
    return this.tokenizer.getNextToken();
  }
}
