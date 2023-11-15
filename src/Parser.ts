import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeReference, CellReference, RowReference, ColumnReference, PrimaryExpression, SyntaxException, BinaryExpression, UnaryExpression, ParenthesisExpression, ReferenceStatement, SyntaxTree } from "./Syntax/SyntaxNode";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Parser {
  private Lexer = new Lexer("");
  private Stack = new Set<string>(); // Set to store parsed cell text references
  private Tokens = Array<SyntaxToken>();
  private Index = 0;

  constructor(public Input: string) {
    this.Lexer.Input = Input;

    while (true) {
      const token = this.Lexer.NextToken();
      this.Tokens.push(token);
      if (token.Kind === SyntaxKind.EOFToken) break;
    }
  }

  // Helper method to check if the next token matches the given kinds
  private Match(...kinds: Array<SyntaxKind>) {
    let offset = this.Index;
    for (var kind of kinds) {
      if (kind !== this.Peek(offset).Kind) return false;
      offset++;
    }
    return true;
  }

  // Get the next token without consuming it
  private Peek(offset: number = 0) {
    const Index = this.Index + offset;
    if (Index < this.Tokens.length) return this.Tokens[Index];
    return this.Tokens[this.Tokens.length - 1];
  }

  // Consume and return the next token
  private NextToken() {
    return this.Tokens.shift();
  }

  // Main parsing method
  public Parse() {
    const Tree = this.ParseReference();
    return new SyntaxTree(SyntaxKind.SyntaxTree, Tree);
  }

  // Parse a reference, which may include cell references and expressions
  private ParseReference() {
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken, SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const Reference = this.ParseCell();
      this.ParsePointer();
      this.Stack.clear();
      const Expression = this.ParseExpression();
      const Referencing = Array.from(this.Stack);
      this.Stack.clear();
      return new ReferenceStatement(SyntaxKind.ReferenceStatement, Reference.Text, Expression, Referencing);
    }
    return this.ParseExpression();
  }

  // Parse pointer tokens (e.g., "->")
  private ParsePointer() {
    if (this.Match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const Token1 = this.NextToken();
      const Token2 = this.NextToken();
      const Text = this.Input.substring(Token1.Position, Token2.Position + Token2.Text.length);
      return new SyntaxToken(SyntaxKind.PointerToken, Text, Token1.Position);
    }
    return this.NextToken();
  }

  // Parse expressions with binary operators
  private ParseExpression(parentPrecedence = 0) {
    let left = this.ParseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.OperatorPrecedence(this.Peek().Kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.NextToken();
      const right = this.ParseExpression(precedence);
      left = new BinaryExpression(SyntaxKind.BinaryExpression, left, operator, right);
    }
    return left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnaryExpression() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const operator = this.NextToken();
      const right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, operator, right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.Match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisExpression(SyntaxKind.ParanthesisExpression, this.NextToken(), this.ParseExpression(), this.NextToken());
    }
    return this.ParseRange();
  }

  // Parse range references (e.g., A1:B3)
  private ParseRange() {
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.IdentifierToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.IdentifierToken, SyntaxKind.ColonToken)) {
      const left = this.ParseCell();
      this.NextToken();
      const right = this.ParseCell();
      const text = left.Text + ":" + right.Text;
      return new RangeReference(SyntaxKind.RangeReference, text, left, right);
    }
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) return this.ParseCell();
    return this.ParsePrimary();
  }

  // Parse a cell reference (e.g., A1)
  private ParseCell() {
    const left = this.ParseColumn();
    const right = this.ParseRow();
    const text = left.Text + right.Text;
    this.Stack.add(text);
    return new CellReference(SyntaxKind.CellReference, text, left, right);
  }

  // Parse a column reference
  private ParseColumn() {
    const text = this.Match(SyntaxKind.IdentifierToken) ? this.NextToken().Text : "";
    return new ColumnReference(SyntaxKind.ColumnReference, text);
  }

  // Parse a row reference
  private ParseRow() {
    const text = this.Match(SyntaxKind.NumberToken) ? this.NextToken().Text : "";
    return new RowReference(SyntaxKind.RowReference, text);
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParsePrimary() {
    const token = this.NextToken();
    switch (token.Kind) {
      case SyntaxKind.NumberToken:
        return new PrimaryExpression(SyntaxKind.NumberExpression, token.Text);
      case SyntaxKind.IdentifierToken:
        return new PrimaryExpression(SyntaxKind.IndentifierExpression, token.Text);
      default:
        return new SyntaxException(token.Kind, token.Text);
    }
  }
}
