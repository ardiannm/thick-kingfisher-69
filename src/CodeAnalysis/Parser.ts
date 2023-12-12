import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { SyntaxTree } from "./Syntax/SyntaxTree";
import { DeclarationStatement } from "./Syntax/DeclarationStatement";
import { BinaryExpression } from "./Syntax/BinaryExpression";
import { UnaryExpression } from "./Syntax/UnaryExpression";
import { ParenthesizedExpression } from "./Syntax/ParenthesizedExpression";
import { RangeReference } from "./Syntax/RangeReference";
import { CellReference } from "./Syntax/CellReference";
import { Facts } from "./Syntax/Facts";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { SourceText } from "./SourceText/SourceText";
import { ExpressionSyntax } from "./Syntax/ExpressionSyntax";
import { StatementSyntax } from "./Syntax/StatementSyntax";
import { Program } from "./Syntax/Program";

export class Parser {
  private Index = 0;
  private Tokens = new Array<SyntaxToken>();
  private Diagnostics = new DiagnosticBag();

  constructor(public readonly Source: SourceText) {
    for (const Token of SyntaxTree.Lex(Source.Text)) {
      switch (Token.Kind) {
        case SyntaxKind.NewLineToken:
        case SyntaxKind.SpaceToken:
        case SyntaxKind.CommentToken:
          continue;
        default:
          this.Tokens.push(Token);
      }
    }
  }

  Parse() {
    const Statements = new Array<StatementSyntax>();
    while (this.Any()) {
      const Statement = this.ParseStatement();
      Statements.push(Statement);
    }
    this.ExpectToken(SyntaxKind.EndOfFileToken);
    return new Program(SyntaxKind.Program, Statements);
  }

  private ParseStatement() {
    const Left = this.ParseBinaryExpression();
    switch (this.CurrentToken.Kind) {
      case SyntaxKind.IsKeyword:
      case SyntaxKind.CopyKeyword:
        const Keyword = this.NextToken();
        const Right = this.ParseBinaryExpression();
        return new DeclarationStatement(SyntaxKind.DeclarationStatement, Left, Keyword, Right);
    }
    return Left;
  }

  private ParseBinaryExpression(ParentPrecedence = 0): ExpressionSyntax {
    let Left = this.ParseUnaryExpression();
    while (true) {
      const BinaryPrecedence = Facts.BinaryOperatorPrecedence(this.CurrentToken.Kind);
      if (BinaryPrecedence === 0 || BinaryPrecedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseBinaryExpression(BinaryPrecedence);
      Left = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  private ParseUnaryExpression(): ExpressionSyntax {
    const BinaryPrecedence = Facts.UnaryOperatorPrecedence(this.CurrentToken.Kind);
    if (BinaryPrecedence !== 0) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParentheses();
  }

  private ParseParentheses() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseBinaryExpression();
      const Right = this.ExpectToken(SyntaxKind.CloseParenToken);
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, Left, Expression, Right);
    }
    return this.ParseRangeReference();
  }

  private ParseRangeReference() {
    const Left = this.ParseCellReference();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCellReference();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  private ParseCellReference() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

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

  private PeekToken(Offset: number) {
    const Index = this.Index + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  private get CurrentToken() {
    return this.PeekToken(0);
  }

  private NextToken() {
    const Token = this.CurrentToken;
    this.Index++;
    return Token;
  }

  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== this.PeekToken(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  private ExpectToken(Kind: SyntaxKind) {
    if (this.MatchToken(Kind)) return this.NextToken();
    const Token = this.NextToken();
    throw this.Diagnostics.TokenNotAMatch(Token.Kind);
  }

  private Any() {
    return !this.MatchToken(SyntaxKind.EndOfFileToken);
  }
}
