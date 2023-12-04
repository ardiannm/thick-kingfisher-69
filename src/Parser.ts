import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxTree } from "./CodeAnalysis/SyntaxTree";
import { ReferenceAssignment } from "./CodeAnalysis/ReferenceAssignment";
import { BinaryExpression } from "./CodeAnalysis/BinaryExpression";
import { UnaryExpression } from "./CodeAnalysis/UnaryExpression";
import { ParenthesizedExpression } from "./CodeAnalysis/ParenthesizedExpression";
import { RangeReference } from "./CodeAnalysis/RangeReference";
import { CellReference } from "./CodeAnalysis/CellReference";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SourceText } from "./CodeAnalysis/Text/SourceText";

export class Parser {
  private Index = 0;
  private Tokens = new Array<SyntaxToken>();

  private Logger = new Diagnostics();

  constructor(public readonly Source: SourceText) {
    for (const Token of SyntaxTree.Lex(Source.Text)) {
      // Push Tokens If Not SpaceToken And Not BadToken
      if (!(Token.Kind === SyntaxKind.SpaceToken) && !(Token.Kind === SyntaxKind.BadToken)) {
        this.Tokens.push(Token);
      }
      // Report If BadTokens
      if (Token.Kind === SyntaxKind.BadToken) this.Logger.BadTokenFound(Token);
    }
  }

  ParseSyntaxTree() {
    const Expressions = new Array();
    while (this.Any()) {
      Expressions.push(this.ParseReferenceDeclaration());
      this.ExpectToken(SyntaxKind.SemiColonToken);
    }
    return new SyntaxTree(SyntaxKind.SyntaxTree, Expressions);
  }

  // Parses A Cell Reference Which When On Change It Auto Updates Other Cells That It References
  private ParseReferenceDeclaration() {
    const Left = this.ParseBinaryExpression();
    if (this.MatchToken(SyntaxKind.PointerToken)) {
      this.NextToken();
      return new ReferenceAssignment(SyntaxKind.ReferenceAssignment, Left, this.ParseBinaryExpression());
    }
    return Left;
  }

  // Parse Expressions With Binary Operators
  private ParseBinaryExpression(ParentPrecedence = 0) {
    let Left = this.ParseUnaryExpression();
    while (true) {
      const BinaryPrecedence = SyntaxFacts.BinaryOperatorPrecedence(this.CurrentToken.Kind);
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
    const BinaryPrecedence = SyntaxFacts.UnaryOperatorPrecedence(this.CurrentToken.Kind);
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
      const Expression = this.ParseBinaryExpression();
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
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

  // Parse Literals (e.g., Numbers, Identifiers, True)
  private ParseLiteral() {
    const Kind = this.CurrentToken.Kind;
    switch (Kind) {
      // case SyntaxKind.TrueToken:
      // case SyntaxKind.FalseToken:
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
        return this.NextToken();
      default:
        return this.ExpectToken(SyntaxKind.NumberToken);
    }
  }

  // Get The Next Token Without Consuming It
  private PeekToken(Offset: number) {
    const Index = this.Index + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  // Peek The Current Token Without Consuming
  private get CurrentToken() {
    return this.PeekToken(0);
  }

  // Consume And Return The Next Token
  private NextToken() {
    const Token = this.CurrentToken;
    this.Index++;
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
    const Token = this.NextToken();
    throw this.Logger.TokenNotAMatch(Kind, Token.Kind);
    // return Token;
  }

  // Check To See If There Are More Tokens
  private Any() {
    return !this.MatchToken(SyntaxKind.EndOfFileToken);
  }
}
