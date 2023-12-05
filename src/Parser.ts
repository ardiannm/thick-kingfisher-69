import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxTree } from "./CodeAnalysis/SyntaxTree";
import { ReferenceDeclaration } from "./CodeAnalysis/ReferenceDeclaration";
import { BinaryExpression } from "./CodeAnalysis/BinaryExpression";
import { UnaryExpression } from "./CodeAnalysis/UnaryExpression";
import { ParenthesizedExpression } from "./CodeAnalysis/ParenthesizedExpression";
import { RangeReference } from "./CodeAnalysis/RangeReference";
import { CellReference } from "./CodeAnalysis/CellReference";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";
import { DiagnosticBag } from "./CodeAnalysis/DiagnosticBag";
import { SourceText } from "./CodeAnalysis/SourceText";

// Parser class responsible for syntactic analysis and building the abstract syntax tree (AST).

export class Parser {
  // Index to keep track of the current position while parsing tokens.
  private Index = 0;
  private Tokens = new Array<SyntaxToken>();

  // Logger for reporting diagnostics and errors during parsing.
  private Logger = new DiagnosticBag();

  // Constructor initializes the parser with the provided source text.
  constructor(public readonly Source: SourceText) {
    // Tokenize the source text and filter out space and bad tokens.
    for (const Token of SyntaxTree.Lex(Source.Text)) {
      if (!(Token.Kind === SyntaxKind.SpaceToken) && !(Token.Kind === SyntaxKind.BadToken)) {
        this.Tokens.push(Token);
      }
      if (Token.Kind === SyntaxKind.BadToken) this.Logger.BadTokenFound(Token);
    }
  }

  // ParseSyntaxTree method parses the source text and generates the abstract syntax tree (AST).
  ParseSyntaxTree() {
    const Expressions = new Array();
    while (this.Any()) {
      Expressions.push(this.ParseReferenceDeclaration());
      this.ExpectToken(SyntaxKind.SemiColonToken);
    }
    return new SyntaxTree(SyntaxKind.SyntaxTree, Expressions);
  }

  // Parses a cell reference which, when changed, auto-updates other cells that it references.
  private ParseReferenceDeclaration() {
    const Left = this.ParseBinaryExpression();
    if (this.MatchToken(SyntaxKind.PointerToken)) {
      this.NextToken();
      return new ReferenceDeclaration(SyntaxKind.ReferenceDeclaration, Left, this.ParseBinaryExpression());
    }
    return Left;
  }

  // Parse expressions with binary operators.
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

  // Parse expressions with unary operators.
  private ParseUnaryExpression() {
    const BinaryPrecedence = SyntaxFacts.UnaryOperatorPrecedence(this.CurrentToken.Kind);
    if (BinaryPrecedence !== 0) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParentheses();
  }

  // Parse expressions enclosed in parentheses.
  private ParseParentheses() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseBinaryExpression();
      const Right = this.ExpectToken(SyntaxKind.CloseParenToken);
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, Left, Expression, Right);
    }
    return this.ParseRange();
  }

  // Parse range reference (e.g., B4:C, B:E).
  private ParseRange() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCell();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  // Parse cell reference (e.g., A1, B7).
  private ParseCell() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

  // Parse literals (e.g., Numbers, Identifiers, True).
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

  // Get the next token without consuming it.
  private PeekToken(Offset: number) {
    const Index = this.Index + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  // Peek the current token without consuming.
  private get CurrentToken() {
    return this.PeekToken(0);
  }

  // Consume and return the next token.
  private NextToken() {
    const Token = this.CurrentToken;
    this.Index++;
    return Token;
  }

  // Helper method to check if the next token matches the given kinds.
  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== this.PeekToken(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  // Expect token kind else report message.
  private ExpectToken(Kind: SyntaxKind) {
    if (this.MatchToken(Kind)) return this.NextToken();
    const Token = this.NextToken();
    throw this.Logger.TokenNotAMatch(Kind, Token.Kind);
  }

  // Check to see if there are more tokens.
  private Any() {
    return !this.MatchToken(SyntaxKind.EndOfFileToken);
  }
}
