import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { CompositeTokenKind } from "./parser/kind/composite.token.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { UnaryOperatorKind } from "./parser/kind/unary.operator.kind";
import { SyntaxToken } from "./parser/syntax.token";
import { BinaryExpression } from "./parser/binary.expression";
import { UnaryExpression } from "./parser/unary.expression";
import { ParenthesizedExpression } from "./parser/parenthesized.expression";
import { RangeReference } from "./parser/range.reference";
import { CellReference } from "./parser/cell.reference";
import { SyntaxFacts } from "./parser/syntax.facts";
import { ExpressionSyntax } from "./parser/expression.syntax";
import { CompilationUnit } from "./parser/compilation.unit";
import { StatementSyntax } from "./parser/statement.syntax";
import { CellAssignment } from "./parser/cell.assignment";
import { FunctionExpression } from "./parser/function.expression";
import { DiagnosticBag } from "./diagnostics/diagnostic.bag";
import { SyntaxTree } from "./parser/syntax.tree";
import { Lexer } from "./lexer";

export class Parser {
  private index = 0;
  private tokens = new Array<SyntaxToken<SyntaxKind>>();
  public readonly diagnostics = new DiagnosticBag();

  private get any() {
    return !this.match(SyntaxNodeKind.EndOfFileToken);
  }

  private get none() {
    return !this.any;
  }

  constructor(public readonly tree: SyntaxTree) {
    const lexer = new Lexer(tree);
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = lexer.lex();
      this.tokens.push(token);
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
    this.diagnostics.merge(lexer.diagnostics);
  }

  public parse() {
    if (this.none) {
      this.diagnostics.emptyProgram();
    }
    return this.parseProgram();
  }

  public parseProgram() {
    const statements = new Array<StatementSyntax>();
    while (this.any) {
      const token = this.token;
      statements.push(this.parseFunction());
      if (this.token === token) this.next();
    }
    return new CompilationUnit(SyntaxNodeKind.CompilationUnit, this.tree, statements, this.expect(SyntaxNodeKind.EndOfFileToken));
  }

  private parseFunction() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.OpenParenthesisToken)) {
      const functionName = this.next() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const openParen = this.expect(SyntaxNodeKind.OpenParenthesisToken);
      const closeParen = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      const openBrace = this.expect(SyntaxNodeKind.OpenBraceToken);
      const statements = new Array<StatementSyntax>();
      while (this.any) {
        if (this.match(SyntaxNodeKind.CloseBraceToken)) break;
        const token = this.token;
        statements.push(this.parseFunction());
        if (this.token === token) this.next();
      }
      const closeBrace = this.expect(SyntaxNodeKind.CloseBraceToken);
      return new FunctionExpression(SyntaxNodeKind.FunctionExpression, this.tree, functionName, openParen, closeParen, openBrace, statements, closeBrace);
    }
    return this.parseStatement();
  }

  private parseStatement() {
    const left = this.parseBinaryExpression();
    switch (this.token.kind) {
      case CompositeTokenKind.ColonColonToken:
        const keyword = this.next() as SyntaxToken<CompositeTokenKind.GreaterGreaterToken>;
        return new CellAssignment(SyntaxNodeKind.CellAssignment, this.tree, left, keyword, this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): ExpressionSyntax {
    let left = this.parseUnaryExpression();
    while (true) {
      const binaryPrecedence = SyntaxFacts.binaryPrecedence(this.token.kind);
      if (binaryPrecedence === 0 || binaryPrecedence <= parentPrecedence) {
        break;
      }
      const operator = this.next() as SyntaxToken<BinaryOperatorKind>;
      const right = this.parseBinaryExpression(binaryPrecedence);
      left = new BinaryExpression(SyntaxNodeKind.BinaryExpression, this.tree, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression(): ExpressionSyntax {
    const BinaryPrecedence = SyntaxFacts.unaryPrecedence(this.token.kind);
    if (BinaryPrecedence !== 0) {
      const operator = this.next() as SyntaxToken<UnaryOperatorKind>;
      const right = this.parseUnaryExpression();
      return new UnaryExpression(SyntaxNodeKind.UnaryExpression, this.tree, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.next();
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      return new ParenthesizedExpression(SyntaxNodeKind.ParenthesizedExpression, this.tree, left, expression, right);
    }
    return this.parseRangeReference();
  }

  private parseRangeReference() {
    const left = this.parseCellReference();
    if (this.match(SyntaxNodeKind.ColonToken)) {
      this.next();
      const right = this.parseCellReference();
      return new RangeReference(SyntaxNodeKind.RangeReference, this.tree, left, right);
    }
    return left;
  }

  private parseCellReference() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.next() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.next() as SyntaxToken<SyntaxNodeKind.NumberToken>;
      return new CellReference(SyntaxNodeKind.CellReference, this.tree, left, right);
    }
    return this.parseLiteral();
  }

  private parseLiteral() {
    const kind = this.token.kind;
    switch (kind) {
      // case TokenKind.TrueToken:
      // case TokenKind.FalseToken:
      case SyntaxNodeKind.IdentifierToken:
      case SyntaxNodeKind.NumberToken:
        return this.next();
      default:
        return this.expect(SyntaxNodeKind.Expression);
    }
  }

  private peekToken(offset: number) {
    const thisIndex = this.index + offset;
    const prevIndex = this.tokens.length - 1;
    if (thisIndex > prevIndex) return this.tokens[prevIndex];
    return this.tokens[thisIndex];
  }

  private get token() {
    return this.peekToken(0);
  }

  private next() {
    const token = this.token;
    this.index++;
    return token;
  }

  private match(...kinds: Array<SyntaxKind>) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== this.peekToken(offset).kind) return false;
      offset++;
    }
    return true;
  }

  private expect<Kind extends SyntaxKind>(kind: Kind): SyntaxToken<Kind> {
    if (this.match(kind)) {
      return this.next() as SyntaxToken<Kind>;
    }
    this.diagnostics.tokenMissmatch(this.token.kind, kind);
    return new SyntaxToken(this.token.kind as Kind, this.tree, this.token.span);
  }
}
