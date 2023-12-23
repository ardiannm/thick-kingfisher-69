import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SyntaxTree } from "./SyntaxTree";
import { BinaryExpression } from "./BinaryExpression";
import { UnaryExpression } from "./UnaryExpression";
import { ParenthesizedExpression } from "./ParenthesizedExpression";
import { RangeReference } from "./RangeReference";
import { CellReference } from "./CellReference";
import { Facts } from "./Facts";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { SourceText } from "../Text/SourceText";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { Program } from "./Program";
import { StatementSyntax } from "./StatementSyntax";
import { DeclarationStatement } from "./DeclarationStatement";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";

export class Parser {
  private Index = 0;
  private Tokens = new Array<SyntaxToken<SyntaxKind>>();
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Parser);

  constructor(public readonly Source: SourceText) {
    this.Tokens = Array.from(SyntaxTree.Lex(Source.Text));
  }

  public Parse() {
    if (this.Any()) {
      const Statements = new Array<StatementSyntax>();
      while (this.Any()) {
        const Statement = this.ParseStatement();
        Statements.push(Statement);
      }
      this.ExpectToken(SyntaxKind.EndOfFileToken);
      return new Program(SyntaxKind.Program, Statements);
    }

    throw this.Diagnostics.SourceCodeIsEmpty();
  }

  private ParseStatement() {
    const Left = this.ParseBinaryExpression();
    switch (this.Token.Kind) {
      case SyntaxKind.PointerToken:
        return new DeclarationStatement(SyntaxKind.ReferenceCell, Left, this.NextToken(), this.ParseBinaryExpression());
      case SyntaxKind.GreaterGreaterToken:
        return new DeclarationStatement(SyntaxKind.CloneCell, Left, this.NextToken(), this.ParseBinaryExpression());
    }
    return Left;
  }

  private ParseBinaryExpression(ParentPrecedence = 0): ExpressionSyntax {
    let Left = this.ParseUnaryExpression();
    while (true) {
      const BinaryPrecedence = Facts.BinaryPrecedence(this.Token.Kind);
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
    const BinaryPrecedence = Facts.UnaryPrecedence(this.Token.Kind);
    if (BinaryPrecedence !== 0) {
      const Operator = this.NextToken();
      const Right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParentheses();
  }

  private ParseParentheses() {
    if (this.MatchToken(SyntaxKind.OpenParenthesisToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseBinaryExpression();
      const Right = this.ExpectToken(SyntaxKind.CloseParenthesisToken);
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
      const Left = this.NextToken() as SyntaxToken<SyntaxKind.IdentifierToken>;
      const Right = this.NextToken() as SyntaxToken<SyntaxKind.NumberToken>;
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

  private ParseLiteral() {
    const Kind = this.Token.Kind;
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

  private get Token() {
    return this.PeekToken(0);
  }

  private NextToken() {
    const Token = this.Token;
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
