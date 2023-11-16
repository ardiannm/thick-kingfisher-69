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
  private Match(Kind: SyntaxKind) {
    if (Kind !== this.Peek(0).Kind) return false;
    return true;
  }

  // Consume and return the next token
  private NextToken() {
    return this.Tokens.shift();
  }

  // Main parsing method
  public Parse() {
    return this.ParseBinary();
  }

  // Parse expressions with binary operators
  private ParseBinary(ParentPrecedence = 0) {
    let Left = this.ParseUnary();
    while (true) {
      const Precedence = SyntaxFacts.OperatorPrecedence(this.Peek().Kind);
      if (Precedence === 0 || Precedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseBinary(Precedence);
      Left = new BinarySyntaxNode(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnary() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnary();
      return new UnarySyntaxNode(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.Match(SyntaxKind.OpenParenthesisToken)) {
      return new ParenthesisSyntaxNode(SyntaxKind.ParanthesisExpression, this.NextToken(), this.ParseBinary(), this.NextToken());
    }
    return this.ParsePrimary();
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
