import { Lexer } from "./Lexer";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxTree, CellReference, BinaryExpression, UnaryExpression, ParenthesizedExpression, RangeReference, ReferenceExpression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Parser {
  public Diagnostics = new Array<string>();

  private Pointer = 0;
  private Tokens = new Array<SyntaxToken>();
  private ReferenceStack = new Set<string>();

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      if (!(Token.Kind === SyntaxKind.SpaceToken) && !(Token.Kind === SyntaxKind.BadToken)) {
        this.Tokens.push(Token);
      }
      if (Token.Kind === SyntaxKind.BadToken) {
        this.Report(`SyntaxError: <${Token.Kind}> Found.`);
      }
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  // Get The Next Token Without Consuming It
  private PeekToken(Offset: number) {
    const Index = this.Pointer + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  // Peek The Current Token Without Consuming
  private CurrentToken() {
    return this.PeekToken(0);
  }

  // Consume And Return The Next Token
  private NextToken() {
    const Token = this.CurrentToken();
    this.Pointer++;
    return Token;
  }

  // Helper Method To Check If The Next Token Matches The Given Kinds
  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== this.PeekToken(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  // Expect Token Kind Else Report Message
  private ExpectToken(Kind: SyntaxKind) {
    if (this.MatchToken(Kind)) return this.NextToken();
    const Token = this.CurrentToken();
    this.Report(`SyntaxError: Expected <${Kind}>; Found <${Token.Kind}>.`);
    return Token;
  }

  // Report Messages Onto Diagnostics
  private Report(message: string) {
    this.Diagnostics.push(message);
  }

  // Main Parsing Method
  public Parse() {
    const Expression = this.ParseReference();
    this.ExpectToken(SyntaxKind.EndOfFileToken);
    return new SyntaxTree(SyntaxKind.SyntaxTree, Expression);
  }

  // Parses A Cell Reference Which When On Change It Auto Updates Other Cells That It References
  private ParseReference() {
    const Left = this.ParseExpression();
    if (this.MatchToken(SyntaxKind.PointerToken)) {
      this.NextToken();
      this.ReferenceStack.clear();
      const Right = this.ParseExpression();
      const Referencing = [...this.ReferenceStack];
      this.ReferenceStack.clear();
      return new ReferenceExpression(SyntaxKind.ReferenceExpression, Left, Referencing, [], Right);
    }
    return Left;
  }

  private ParseExpression() {
    return this.ParseBinaryExpression();
  }

  // Parse Expressions With Binary Operators
  private ParseBinaryExpression(ParentPrecedence = 0) {
    let Left = this.ParseUnaryExpression();
    while (true) {
      const BinaryPrecedence = SyntaxFacts.BinaryOperatorPrecedence(this.CurrentToken().Kind);
      if (BinaryPrecedence === 0 || BinaryPrecedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseBinaryExpression(BinaryPrecedence);
      Left = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse Expressions With Unary Operators
  private ParseUnaryExpression() {
    const BinaryPrecedence = SyntaxFacts.UnaryOperatorPrecedence(this.CurrentToken().Kind);
    if (BinaryPrecedence !== 0) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParentheses();
  }

  // Parse Expressions Enclosed In Parentheses
  private ParseParentheses() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseExpression();
      const Right = this.ExpectToken(SyntaxKind.CloseParenToken);
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, Left, Expression, Right);
    }
    return this.ParseRange();
  }

  // Parse Range Reference (e.g., B4:C, B:E)
  private ParseRange() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCell();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  // Parse Cell Reference (e.g., A1, B7)
  private ParseCell() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      const Reference = Left.Text + Right.Text;
      this.ReferenceStack.add(Reference);
      return new CellReference(SyntaxKind.CellReference, Reference, Left, Right);
    }
    return this.ParseLiteral();
  }

  // Parse Literals (e.g., Numbers, Identifiers, True)
  private ParseLiteral() {
    const Kind = this.CurrentToken().Kind;
    switch (Kind) {
      case SyntaxKind.TrueToken:
      case SyntaxKind.FalseToken:
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
        return this.NextToken();
      default:
        return this.ExpectToken(SyntaxKind.Expression);
    }
  }
}
