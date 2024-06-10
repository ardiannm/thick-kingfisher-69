import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { CompositeTokenKind } from "./parser/kind/composite.token.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { UnaryOperatorKind } from "./parser/kind/unary.operator.kind";
import { SyntaxToken, TokenText } from "./parser/syntax.token";
import { BinaryExpression } from "./parser/binary.expression";
import { UnaryExpression } from "./parser/unary.expression";
import { ParenthesizedExpression } from "./parser/parenthesized.expression";
import { RangeReference } from "./parser/range.reference";
import { CellReference } from "./parser/cell.reference";
import { SyntaxFacts } from "./parser/syntax.facts";
import { ExpressionSyntax } from "./parser/expression.syntax";
import { Program } from "./parser/program";
import { StatementSyntax } from "./parser/statement.syntax";
import { CellAssignment } from "./parser/cell.assignment";
import { FunctionExpression } from "./parser/function.expression";
import { SourceText } from "./input/source.text";
import { DiagnosticBag } from "./diagnostics/diagnostic.bag";

export class Parser {
  private index = 0;
  private tokens = new Array<SyntaxToken<SyntaxKind>>();
  private trivia = new Array<SyntaxToken<SyntaxKind>>();

  private get any() {
    return !this.MatchToken(SyntaxNodeKind.EndOfFileToken);
  }

  private get none() {
    return !this.any;
  }

  constructor(public readonly input: SourceText, public diagnostics: DiagnosticBag) {
    for (const token of this.input.tokens) {
      if (SyntaxFacts.IsTrivia(token.kind)) {
        this.trivia.push(token);
      } else {
        this.tokens.push(token.EatTrivia(this.trivia));
      }
    }
  }

  public Parse() {
    if (this.none) {
      this.diagnostics.EmptyProgram();
    }
    return this.ParseProgram();
  }

  public ParseProgram() {
    const statements = new Array<StatementSyntax>();
    while (this.any) {
      const token = this.token;
      statements.push(this.ParseFunction());
      if (this.token === token) this.NextToken();
    }
    return new Program(SyntaxNodeKind.Program, statements, this.ExpectToken(SyntaxNodeKind.EndOfFileToken));
  }

  private ParseFunction() {
    if (this.MatchToken(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.OpenParenthesisToken)) {
      const functionName = this.NextToken() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const openParen = this.ExpectToken(SyntaxNodeKind.OpenParenthesisToken);
      const closeParen = this.ExpectToken(SyntaxNodeKind.CloseParenthesisToken);
      const openBrace = this.ExpectToken(SyntaxNodeKind.OpenBraceToken);
      const statements = new Array<StatementSyntax>();
      while (this.any) {
        if (this.MatchToken(SyntaxNodeKind.CloseBraceToken)) break;
        const token = this.token;
        statements.push(this.ParseFunction());
        if (this.token === token) this.NextToken();
      }
      const closeBrace = this.ExpectToken(SyntaxNodeKind.CloseBraceToken);
      return new FunctionExpression(SyntaxNodeKind.FunctionExpression, functionName, openParen, closeParen, openBrace, statements, closeBrace);
    }
    return this.ParseStatement();
  }

  private ParseStatement() {
    const left = this.ParseBinaryExpression();
    switch (this.token.kind) {
      case CompositeTokenKind.ColonColonToken:
        const keyword = this.NextToken() as SyntaxToken<CompositeTokenKind.GreaterGreaterToken>;
        return new CellAssignment(SyntaxNodeKind.CellAssignment, left, keyword, this.ParseBinaryExpression());
    }
    return left;
  }

  private ParseBinaryExpression(parentPrecedence = 0): ExpressionSyntax {
    let left = this.ParseUnaryExpression();
    while (true) {
      const binaryPrecedence = SyntaxFacts.BinaryPrecedence(this.token.kind);
      if (binaryPrecedence === 0 || binaryPrecedence <= parentPrecedence) {
        break;
      }
      const operator = this.NextToken() as SyntaxToken<BinaryOperatorKind>;
      const right = this.ParseBinaryExpression(binaryPrecedence);
      left = new BinaryExpression(SyntaxNodeKind.BinaryExpression, left, operator, right);
    }
    return left;
  }

  private ParseUnaryExpression(): ExpressionSyntax {
    const BinaryPrecedence = SyntaxFacts.UnaryPrecedence(this.token.kind);
    if (BinaryPrecedence !== 0) {
      const operator = this.NextToken() as SyntaxToken<UnaryOperatorKind>;
      const right = this.ParseUnaryExpression();
      return new UnaryExpression(SyntaxNodeKind.UnaryExpression, operator, right);
    }
    return this.ParseParenthesis();
  }

  private ParseParenthesis() {
    if (this.MatchToken(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.NextToken();
      const expression = this.ParseBinaryExpression();
      const right = this.ExpectToken(SyntaxNodeKind.CloseParenthesisToken);
      return new ParenthesizedExpression(SyntaxNodeKind.ParenthesizedExpression, left, expression, right);
    }
    return this.ParseRangeReference();
  }

  private ParseRangeReference() {
    const left = this.ParseCellReference();
    if (this.MatchToken(SyntaxNodeKind.ColonToken)) {
      this.NextToken();
      const right = this.ParseCellReference();
      return new RangeReference(SyntaxNodeKind.RangeReference, left, right);
    }
    return left;
  }

  private ParseCellReference() {
    if (this.MatchToken(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.NextToken() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.NextToken() as SyntaxToken<SyntaxNodeKind.NumberToken>;
      return new CellReference(SyntaxNodeKind.CellReference, left, right);
    }
    return this.ParseLiteral();
  }

  private ParseLiteral() {
    const kind = this.token.kind;
    switch (kind) {
      // case TokenKind.TrueToken:
      // case TokenKind.FalseToken:
      case SyntaxNodeKind.IdentifierToken:
      case SyntaxNodeKind.NumberToken:
        return this.NextToken();
      default:
        return this.ExpectToken(SyntaxNodeKind.Expression);
    }
  }

  private PeekToken(offset: number) {
    const thisIndex = this.index + offset;
    const prevIndex = this.tokens.length - 1;
    if (thisIndex > prevIndex) return this.tokens[prevIndex];
    return this.tokens[thisIndex];
  }

  private get token() {
    return this.PeekToken(0);
  }

  private NextToken() {
    const token = this.token;
    this.index++;
    return token;
  }

  private MatchToken(...kinds: Array<SyntaxKind>) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== this.PeekToken(offset).kind) return false;
      offset++;
    }
    return true;
  }

  private ExpectToken<Kind extends SyntaxKind>(kind: Kind): SyntaxToken<Kind> {
    if (this.MatchToken(kind)) {
      return this.NextToken() as SyntaxToken<Kind>;
    }
    this.diagnostics.TokenMissmatch(this.token.kind, kind);
    return new SyntaxToken(this.token.kind as Kind, this.token.text as TokenText<Kind>, this.token.GetSpan());
  }
}
