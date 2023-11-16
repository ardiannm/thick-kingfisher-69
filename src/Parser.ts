import { Lexer } from "./Lexer";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { CellSyntax, PrimarySyntax, BadSyntax, BinarySyntax, UnarySyntax, ParenthesisSyntax, RangeSyntax, ReferenceSyntax } from "./CodeAnalysis/SyntaxNode";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

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
  }

  // Get the next token without consuming it
  private Peek(Offset: number = 0) {
    const Index = this.Index + Offset;
    if (Index < this.Tokens.length) {
      return this.Tokens[Index];
    }
    return this.Tokens[this.Tokens.length - 1];
  }

  // Helper method to check if the next token matches the given kinds
  private Match(Kind: SyntaxKind) {
    if (Kind !== this.Peek(0).Kind) return false;
    return true;
  }

  // Consume and return the next token
  private NextToken() {
    const Token = this.Peek();
    this.Index++;
    return Token;
  }

  // Main parsing method
  public Parse() {
    // if (this.Match(SyntaxKind.EOFToken)) return this.NextToken();
    return this.ParseReference();
  }

  private ParseReference() {
    const Left = this.ParseRange();
    if (this.Peek(0).Kind === SyntaxKind.MinusToken && this.Peek(1).Kind === SyntaxKind.GreaterToken) {
      this.NextToken();
      this.NextToken();
      this.ReferenceStack.clear();
      const Right = this.ParseBinary();
      const Node = new ReferenceSyntax(SyntaxKind.ReferenceSyntax, Left, Right, Array.from(this.ReferenceStack));
      this.ReferenceStack.clear();
      return Node;
    }
    return Left;
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
      Left = new BinarySyntax(SyntaxKind.BinarySyntax, Left, Operator, Right);
    }
    return Left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnary() {
    if (this.Match(SyntaxKind.PlusToken) || this.Match(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnary();
      return new UnarySyntax(SyntaxKind.UnarySyntax, Operator, Right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.Match(SyntaxKind.OpenParenToken)) {
      return new ParenthesisSyntax(SyntaxKind.ParenthesisSyntax, this.NextToken(), this.ParseBinary(), this.NextToken());
    }
    return this.ParseRange();
  }

  private ParseRange() {
    const Left = this.ParsePrimary();
    if (this.Match(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParsePrimary();
      return new RangeSyntax(SyntaxKind.RangeSyntax, Left, Right);
    }
    return Left;
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParsePrimary() {
    const Left = this.NextToken();
    switch (Left.Kind) {
      case SyntaxKind.NumberToken:
        return new PrimarySyntax(SyntaxKind.NumberSyntax, Left.Text);
      case SyntaxKind.IdentifierToken:
        if (this.Match(SyntaxKind.NumberToken)) {
          const Right = this.NextToken();
          const NodeReference = Left.Text + Right.Text;
          this.ReferenceStack.add(NodeReference); // add cell reference to the stack of references
          return new CellSyntax(SyntaxKind.CellSyntax, Left.Text, Right.Text);
        }
        return new PrimarySyntax(SyntaxKind.IdentifierSyntax, Left.Text);
      case SyntaxKind.EOFToken:
        this.Tokens.push(Left);
        return Left;
      default:
        return new BadSyntax(Left.Kind, Left.Text);
    }
  }
}
