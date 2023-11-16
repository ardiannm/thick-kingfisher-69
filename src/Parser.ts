import { Lexer } from "./Lexer";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { RangeSyntaxNode, CellSyntaxNode, RowSyntaxNode, ColumnSyntaxNode, PrimarySyntaxNode, BadSyntaxNode, BinarySyntaxNode, UnarySyntaxNode, ParenthesisSyntaxNode, ReferenceSyntaxNode } from "./Syntax/SyntaxNode";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Parser {
  private Index = 0;
  private ReferenceStack = new Set<string>(); // Set to store parsed cell text references
  private Tokens = Array<SyntaxToken>();

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);

    while (true) {
      const Token = Tokenizer.Lex();
      this.Tokens.push(Token);
      if (Token.Kind === SyntaxKind.EOFToken) break;
    }

    console.log(this.Tokens);
  }

  // Get the next token without consuming it
  private Peek(Offset: number = 0) {
    const Index = this.Index + Offset;
    if (Index < this.Tokens.length) return this.Tokens[Index];
    return this.Tokens[this.Tokens.length - 1];
  }

  // Helper method to check if the next token matches the given kinds
  private Match(...Kinds: Array<SyntaxKind>) {
    let Offset = this.Index;
    for (var Kind of Kinds) {
      if (Kind !== this.Peek(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  // Consume and return the next token
  private NextToken() {
    return this.Tokens.shift();
  }

  // Main parsing method
  public Parse() {
    return this.ParseReference();
  }

  // Parse a reference, which may include cell references and expressions
  private ParseReference() {
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken, SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      const Reference = this.ParseCell();
      this.ParsePointer();
      this.ReferenceStack.clear();
      const Expression = this.ParseExpression();
      const Referencing = Array.from(this.ReferenceStack);
      this.ReferenceStack.clear();
      return new ReferenceSyntaxNode(SyntaxKind.ReferenceSyntax, Reference.Text, Expression, Referencing);
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
  private ParseExpression(ParentPrecedence = 0) {
    let Left = this.ParseUnaryExpression();
    while (true) {
      const Precedence = SyntaxFacts.OperatorPrecedence(this.Peek().Kind);
      if (Precedence === 0 || Precedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseExpression(Precedence);
      Left = new BinarySyntaxNode(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnaryExpression() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnarySyntaxNode(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.Match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisSyntaxNode(SyntaxKind.ParanthesisExpression, this.NextToken(), this.ParseExpression(), this.NextToken());
    }
    return this.ParseRange();
  }

  // Parse range references (e.g., A1:B3)
  private ParseRange() {
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.IdentifierToken, SyntaxKind.ColonToken) || this.Match(SyntaxKind.NumberToken, SyntaxKind.ColonToken)) {
      const Left = this.ParseCell();
      this.NextToken();
      const Right = this.ParseCell();
      const Text = Left.Text + ":" + Right.Text;
      return new RangeSyntaxNode(SyntaxKind.RangeReference, Text, Left, Right);
    }
    if (this.Match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) return this.ParseCell();
    return this.ParsePrimary();
  }

  // Parse a cell reference (e.g., A1)
  private ParseCell() {
    const Left = this.ParseColumn();
    const Right = this.ParseRow();
    const Text = Left.Text + Right.Text;
    this.ReferenceStack.add(Text);
    return new CellSyntaxNode(SyntaxKind.CellReference, Text, Left, Right);
  }

  // Parse a column reference
  private ParseColumn() {
    const Text = this.Match(SyntaxKind.IdentifierToken) ? this.NextToken().Text : "";
    return new ColumnSyntaxNode(SyntaxKind.ColumnReference, Text);
  }

  // Parse a row reference
  private ParseRow() {
    const Text = this.Match(SyntaxKind.NumberToken) ? this.NextToken().Text : "";
    return new RowSyntaxNode(SyntaxKind.RowReference, Text);
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParsePrimary() {
    const Token = this.NextToken();
    switch (Token.Kind) {
      case SyntaxKind.NumberToken:
        return new PrimarySyntaxNode(SyntaxKind.NumberExpression, Token.Text);
      case SyntaxKind.IdentifierToken:
        return new PrimarySyntaxNode(SyntaxKind.IdentifierExpression, Token.Text);
      default:
        return new BadSyntaxNode(Token.Kind, Token.Text);
    }
  }
}
