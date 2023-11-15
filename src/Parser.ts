import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeReference, CellReference, RowReference, ColumnReference, PrimaryExpression, BadSyntax, BinaryExpression, UnaryExpression, ParenthesisExpression, ReferenceStatement, SyntaxTree } from "./Syntax/SyntaxNode";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Parser {
  private Stack = new Set<string>(); // Set to store parsed cell text references
  private Tokens = Array<SyntaxToken>();
  private Index = 0;

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);

    while (true) {
      const Token = Tokenizer.Lex();
      this.Tokens.push(Token);
      if (Token.Kind === SyntaxKind.EOFToken) break;
    }
  }

  // Helper method to check if the next token matches the given kinds
  private Match(...kinds: Array<SyntaxKind>) {
    let Offset = this.Index;
    for (var Kind of kinds) {
      if (Kind !== this.Peek(Offset).Kind) return false;
      Offset++;
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
    let Left = this.ParseUnaryExpression();
    while (true) {
      const Precedence = SyntaxFacts.OperatorPrecedence(this.Peek().Kind);
      if (Precedence === 0 || Precedence <= parentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseExpression(Precedence);
      Left = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnaryExpression() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
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
      const Left = this.ParseCell();
      this.NextToken();
      const Right = this.ParseCell();
      const Text = Left.Text + ":" + Right.Text;
      return new RangeReference(SyntaxKind.RangeReference, Text, Left, Right);
    }
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) return this.ParseCell();
    return this.ParsePrimary();
  }

  // Parse a cell reference (e.g., A1)
  private ParseCell() {
    const Left = this.ParseColumn();
    const Right = this.ParseRow();
    const Text = Left.Text + Right.Text;
    this.Stack.add(Text);
    return new CellReference(SyntaxKind.CellReference, Text, Left, Right);
  }

  // Parse a column reference
  private ParseColumn() {
    const Text = this.Match(SyntaxKind.IdentifierToken) ? this.NextToken().Text : "";
    return new ColumnReference(SyntaxKind.ColumnReference, Text);
  }

  // Parse a row reference
  private ParseRow() {
    const Text = this.Match(SyntaxKind.NumberToken) ? this.NextToken().Text : "";
    return new RowReference(SyntaxKind.RowReference, Text);
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParsePrimary() {
    const Token = this.NextToken();
    switch (Token.Kind) {
      case SyntaxKind.NumberToken:
        return new PrimaryExpression(SyntaxKind.NumberExpression, Token.Text);
      case SyntaxKind.IdentifierToken:
        return new PrimaryExpression(SyntaxKind.IdentifierExpression, Token.Text);
      default:
        return new BadSyntax(Token.Kind, Token.Text);
    }
  }
}
