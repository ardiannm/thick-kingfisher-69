import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeReference, CellReference, RowReference, ColumnReference, PrimaryExpression, Exception, BinaryExpression, UnaryExpression, ParenthesisExpression, ReferenceStatement, SyntaxTree } from "./Syntax/Syntax";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Parser {
  private lexer = new Lexer("");
  private arr = new Array<SyntaxToken>();
  private stack = new Set<string>(); // Set to store parsed cell text references
  private defaultInitPeek = 1; // Initial value for token peeking
  private peek = this.defaultInitPeek; // Current position for token peeking

  constructor(public input: string) {
    this.lexer.input = input;
  }

  // Helper method to check if the next token matches the given kinds
  private Match(...kinds: Array<SyntaxKind>) {
    this.peek = this.defaultInitPeek;
    for (var kind of kinds) {
      if (kind !== this.PeekToken().kind) return false;
      this.peek++;
    }
    this.peek = this.defaultInitPeek;
    return true;
  }

  // Get the next token without consuming it
  private PeekToken() {
    if (this.peek > this.arr.length) this.arr.push(this.lexer.NextToken());
    return this.arr[this.peek - this.defaultInitPeek];
  }

  // Consume and return the next token
  private ParseToken() {
    if (this.arr.length > 0) return this.arr.shift();
    return this.lexer.NextToken();
  }

  // Main parsing method
  public Parse() {
    const tree = this.ParseReference();
    return new SyntaxTree(SyntaxKind.SyntaxTree, tree);
  }

  // Parse a reference, which may include cell references and expressions
  private ParseReference() {
    if (this.Match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const reference = this.ParseCell();
      this.ParsePointer();
      this.stack.clear();
      const expression = this.ParseExpression();
      const referencing = Array.from(this.stack);
      this.stack.clear();
      return new ReferenceStatement(SyntaxKind.ReferenceStatement, reference.text, expression, referencing);
    }
    return this.ParseExpression();
  }

  // Parse pointer tokens (e.g., "->")
  private ParsePointer() {
    if (this.Match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const a = this.ParseToken();
      const b = this.ParseToken();
      const text = this.input.substring(a.position, b.position + b.text.length);
      return new SyntaxToken(SyntaxKind.PointerToken, text, a.position);
    }
    return this.ParseToken();
  }

  // Parse expressions with binary operators
  private ParseExpression(parentPrecedence = 0) {
    let left = this.ParseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.OperatorPrecedence(this.PeekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.ParseToken();
      const right = this.ParseExpression(precedence);
      left = new BinaryExpression(SyntaxKind.BinaryExpression, left, operator, right);
    }
    return left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnaryExpression() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const operator = this.ParseToken();
      const right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, operator, right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.Match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisExpression(SyntaxKind.ParanthesisExpression, this.ParseToken(), this.ParseExpression(), this.ParseToken());
    }
    return this.ParseRange();
  }

  // Parse range references (e.g., A1:B3)
  private ParseRange() {
    if (this.Match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.IndentifierToken, SyntaxKind.ColonToken)) {
      const left = this.ParseCell();
      this.ParseToken();
      const right = this.ParseCell();
      const text = left.text + ":" + right.text;
      return new RangeReference(SyntaxKind.RangeReference, text, left, right);
    }
    if (this.Match(SyntaxKind.IndentifierToken, SyntaxKind.NumberToken)) return this.ParseCell();
    return this.ParsePrimary();
  }

  // Parse a cell reference (e.g., A1)
  private ParseCell() {
    const left = this.ParseColumn();
    const right = this.ParseRow();
    const text = left.text + right.text;
    this.stack.add(text);
    return new CellReference(SyntaxKind.CellReference, text, left, right);
  }

  // Parse a column reference
  private ParseColumn() {
    const text = this.Match(SyntaxKind.IndentifierToken) ? this.ParseToken().text : "";
    return new ColumnReference(SyntaxKind.ColumnReference, text);
  }

  // Parse a row reference
  private ParseRow() {
    const text = this.Match(SyntaxKind.NumberToken) ? this.ParseToken().text : "";
    return new RowReference(SyntaxKind.RowReference, text);
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParsePrimary() {
    const token = this.ParseToken();
    switch (token.kind) {
      case SyntaxKind.NumberToken:
        return new PrimaryExpression(SyntaxKind.NumberExpression, token.text);
      case SyntaxKind.IndentifierToken:
        return new PrimaryExpression(SyntaxKind.IndentifierExpression, token.text);
      default:
        return new Exception(token.kind, token.text);
    }
  }
}
