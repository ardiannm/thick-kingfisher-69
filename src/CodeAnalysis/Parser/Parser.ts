import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken, TokenText } from "./SyntaxToken";
import { BinaryExpression } from "./BinaryExpression";
import { UnaryExpression } from "./UnaryExpression";
import { ParenthesizedExpression } from "./ParenthesizedExpression";
import { RangeReference } from "./RangeReference";
import { CellReference } from "./CellReference";
import { Facts } from "./Facts";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { Program } from "./Program";
import { StatementSyntax } from "./StatementSyntax";
import { Lexer } from "./Lexer";
import { CellAssignment } from "./CellAssignment";
import { SourceText } from "../../Text/SourceText";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";

export class Parser {
  private Tokens = new Array<SyntaxToken<SyntaxKind>>();
  private Trivias = new Array<SyntaxToken<SyntaxKind>>();

  private Index = 0;

  constructor(public readonly Input: SourceText, public Diagnostics: DiagnosticBag) {
    const Tokenizer = new Lexer(Input, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      if (Facts.IsTrivia(Token.Kind)) {
        this.Trivias.push(Token);
      } else {
        this.Tokens.push(Token.EatTrivia(this.Trivias));
      }
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  public Parse() {
    if (this.None()) {
      this.Diagnostics.EmptyProgram();
    }
    return this.ParseProgram();
  }

  public ParseProgram() {
    const Members = new Array<StatementSyntax>();
    while (this.Any()) {
      const Token = this.Token;
      const Member = this.ParseStatement();
      Members.push(Member);
      if (this.Token === Token) this.NextToken();
    }
    return new Program(SyntaxKind.Program, Members, this.ExpectToken(SyntaxKind.EndOfFileToken));
  }

  private ParseStatement() {
    const Left = this.ParseBinaryExpression();
    switch (this.Token.Kind) {
      case SyntaxKind.PointerToken:
        const Keyword = this.NextToken() as SyntaxToken<SyntaxKind.GreaterGreaterToken>;
        return new CellAssignment(SyntaxKind.CellAssignment, Left, Keyword, this.ParseBinaryExpression());
      // case SyntaxKind.GreaterGreaterToken:
      //   return new DeclarationStatement(SyntaxKind.CloneCell, Left, this.NextToken(), this.ParseBinaryExpression());
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
    return this.ParseParenthesis();
  }

  private ParseParenthesis() {
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
        return this.ExpectToken(SyntaxKind.Expression);
    }
  }

  private ParseNewLineTokens() {
    this.ExpectToken(SyntaxKind.LineBreakTrivia);
    while (this.MatchToken(SyntaxKind.LineBreakTrivia)) this.NextToken();
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
    this.Diagnostics.TokenMissmatch(this.Token.Kind, Kind);
    return new SyntaxToken(this.Token.Kind as Kind, this.Token.Text as TokenText<Kind>, this.Token.TextSpan());
  }

  private Any() {
    return !this.MatchToken(SyntaxKind.EndOfFileToken);
  }

  private None() {
    return !this.Any();
  }
}
