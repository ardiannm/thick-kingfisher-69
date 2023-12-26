import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken, TokenText } from "./SyntaxToken";
import { BinaryExpression } from "./BinaryExpression";
import { UnaryExpression } from "./UnaryExpression";
import { ParenthesizedExpression } from "./ParenthesizedExpression";
import { RangeReference } from "./RangeReference";
import { CellReference } from "./CellReference";
import { Facts } from "./Facts";
import { SourceText } from "../../SourceText";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { Program } from "./Program";
import { StatementSyntax } from "./StatementSyntax";
import { DeclarationStatement } from "./DeclarationStatement";
import { Lexer } from "./Lexer";
import { DiagnosticBag } from "../../DiagnosticBag";
import { DiagnosticPhase } from "../../DiagnosticPhase";

export class Parser {
  private Index = 0;
  private Tokens = new Array<SyntaxToken<SyntaxKind>>();
  private Phase = DiagnosticPhase.Parser;

  constructor(public readonly Input: SourceText, private Diagnostics: DiagnosticBag) {
    const Tokenizer = new Lexer(Input, this.Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;

    do {
      Token = Tokenizer.Lex();
      switch (Token.Kind) {
        case SyntaxKind.BadToken:
        case SyntaxKind.SpaceToken:
        case SyntaxKind.CommentToken:
          continue;
      }
      this.Tokens.push(Token);
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  public Parse() {
    if (!this.MoreTokens()) {
      this.Diagnostics.ReportEmptyProgram(this.Phase);
    }
    const Members = new Array<StatementSyntax>();
    while (this.MoreTokens()) {
      const Token = this.Token;
      const Member = this.ParseMember();
      Members.push(Member);
      if (this.Token === Token) this.NextToken();
    }
    this.ExpectToken(SyntaxKind.EndOfFileToken);
    return new Program(SyntaxKind.Program, Members);
  }

  private ParseMember() {
    const Left = this.ParseStatement();
    if (this.MoreTokens()) this.ParseNewLineTokens();
    return Left;
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

  private ParseNewLineTokens() {
    this.ExpectToken(SyntaxKind.NewLineToken);
    while (this.MatchToken(SyntaxKind.NewLineToken)) this.NextToken();
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

  private ExpectToken<Kind extends SyntaxKind>(Kind: Kind): SyntaxToken<Kind> {
    if (this.MatchToken(Kind)) {
      return this.NextToken() as SyntaxToken<Kind>;
    }
    this.Diagnostics.ReportTokenMissmatch(this.Phase, this.Token.Kind, Kind);
    return new SyntaxToken(this.Token.Kind as Kind, this.Token.Text as TokenText<Kind>);
  }

  private MoreTokens() {
    return !this.MatchToken(SyntaxKind.EndOfFileToken);
  }
}
