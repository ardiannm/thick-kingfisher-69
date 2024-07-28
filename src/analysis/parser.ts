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
import { CellAssignment } from "./parser/cell.assignment";
import { SyntaxTree } from "../runtime/syntax.tree";
import { Lexer } from "./lexer";
import { BlockScope, BlockStatements } from "./parser/block.statement";

export class Parser {
  private index = 0;
  private tokens = new Array<SyntaxToken<SyntaxKind>>();

  private hasMoreTokens() {
    return !this.match(SyntaxNodeKind.EndOfFileToken);
  }

  private hasNoMoreTokens() {
    return !this.hasMoreTokens();
  }

  constructor(public readonly tree: SyntaxTree) {
    const lexer = new Lexer(tree);
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = lexer.lex();
      if (token.kind === SyntaxNodeKind.BadToken) continue;
      this.tokens.push(token);
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
  }

  public parseCompilationUnit() {
    if (this.hasNoMoreTokens()) {
      this.tree.diagnosticsBag.emptyProgram(this.nextToken.span);
    }
    const members = new Array<ExpressionSyntax>();
    while (this.hasMoreTokens()) {
      const startToken = this.peekToken();
      members.push(this.parseStatements());
      if (startToken === this.peekToken()) this.nextToken;
    }
    const root = new BlockStatements(this.tree, members);
    return new CompilationUnit(this.tree, root, this.expect(SyntaxNodeKind.EndOfFileToken));
  }

  private parseStatements() {
    if (this.match(SyntaxNodeKind.OpenBraceToken)) {
      const members = new Array<ExpressionSyntax>();
      const openBrace = this.expect(SyntaxNodeKind.OpenBraceToken);
      while (this.hasMoreTokens() && !this.match(SyntaxNodeKind.CloseBraceToken)) {
        const startToken = this.peekToken();
        members.push(this.parseStatements());
        if (startToken === this.peekToken()) this.nextToken;
      }
      const closeBrace = this.expect(SyntaxNodeKind.CloseBraceToken);
      return new BlockScope(this.tree, openBrace, new BlockStatements(this.tree, members), closeBrace);
    }
    return this.parseCellAssignment();
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    switch (this.peekToken().kind) {
      case CompositeTokenKind.ColonColonToken:
        const keyword = this.nextToken as SyntaxToken<CompositeTokenKind.ColonColonToken>;
        return new CellAssignment(this.tree, left, keyword, this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): ExpressionSyntax {
    let left = this.parseUnaryExpression();
    while (true) {
      const binaryPrecedence = SyntaxFacts.binaryPrecedence(this.peekToken().kind);
      if (binaryPrecedence === 0 || binaryPrecedence <= parentPrecedence) {
        break;
      }
      const operator = this.nextToken as SyntaxToken<BinaryOperatorKind>;
      const right = this.parseBinaryExpression(binaryPrecedence);
      left = new BinaryExpression(this.tree, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression(): ExpressionSyntax {
    const BinaryPrecedence = SyntaxFacts.unaryPrecedence(this.peekToken().kind);
    if (BinaryPrecedence !== 0) {
      const operator = this.nextToken as SyntaxToken<UnaryOperatorKind>;
      const right = this.parseUnaryExpression();
      return new UnaryExpression(this.tree, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.nextToken;
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      return new ParenthesizedExpression(this.tree, left, expression, right);
    }
    return this.parseRangeReference();
  }

  private parseRangeReference() {
    const left = this.parseCellReference();
    if (this.match(SyntaxNodeKind.ColonToken)) {
      this.nextToken;
      const right = this.parseCellReference();
      return new RangeReference(this.tree, left, right);
    }
    return left;
  }

  private parseCellReference() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.nextToken as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.nextToken as SyntaxToken<SyntaxNodeKind.NumberToken>;
      const node = new CellReference(this.tree, left, right);
      if (right.hasTrivia()) {
        this.tree.diagnosticsBag.badCellReference(node.text, node.span);
      }
      return node;
    }
    return this.parseLiteral();
  }

  private parseLiteral() {
    const kind = this.peekToken().kind;
    switch (kind) {
      // case TokenKind.TrueToken:
      // case TokenKind.FalseToken:
      case SyntaxNodeKind.IdentifierToken:
      case SyntaxNodeKind.NumberToken:
        return this.nextToken;
      default:
        return this.expect(SyntaxNodeKind.Expression);
    }
  }

  private peekToken(offset: number = 0) {
    const thisIndex = this.index + offset;
    const prevIndex = this.tokens.length - 1;
    if (thisIndex > prevIndex) return this.tokens[prevIndex];
    return this.tokens[thisIndex];
  }

  private get nextToken() {
    const token = this.peekToken();
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
      return this.nextToken as SyntaxToken<Kind>;
    }
    const token = this.peekToken();
    this.tree.diagnosticsBag.badTokenFound(token.kind, kind, token.span);
    return new SyntaxToken(this.tree, token.kind as Kind, token.span);
  }
}
