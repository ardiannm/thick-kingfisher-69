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
import { BlockScope, BlockStatement } from "./parser/block.statement";

export class Parser {
  private index = 0;
  private tokens = new Array<SyntaxToken<SyntaxKind>>();

  private hasMoreTokens() {
    return !this.match(SyntaxNodeKind.EndOfFileToken);
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
    const members = new Array<ExpressionSyntax>(this.parseStatement());
    while (this.hasMoreTokens()) {
      members.push(this.parseStatement());
    }
    const root = new BlockStatement(this.tree, members);
    return new CompilationUnit(this.tree, root, this.expect(SyntaxNodeKind.EndOfFileToken));
  }

  private parseStatement() {
    if (this.match(SyntaxNodeKind.OpenBraceToken)) {
      const members = new Array<ExpressionSyntax>();
      const openBrace = this.expect(SyntaxNodeKind.OpenBraceToken);
      while (this.hasMoreTokens() && !this.match(SyntaxNodeKind.CloseBraceToken)) {
        members.push(this.parseStatement());
      }
      const closeBrace = this.expect(SyntaxNodeKind.CloseBraceToken);
      return new BlockScope(this.tree, openBrace, new BlockStatement(this.tree, members), closeBrace);
    }
    return this.parseCellAssignment();
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    switch (this.peekToken().kind) {
      case CompositeTokenKind.ColonColonToken:
        const keyword = this.nextToken() as SyntaxToken<CompositeTokenKind.ColonColonToken>;
        return new CellAssignment(this.tree, left, keyword, this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): ExpressionSyntax {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.binaryPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.nextToken() as SyntaxToken<BinaryOperatorKind>;
      const right = this.parseBinaryExpression(precedence);
      left = new BinaryExpression(this.tree, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression(): ExpressionSyntax {
    const precedence = SyntaxFacts.unaryPrecedence(this.peekToken().kind);
    if (precedence) {
      const operator = this.nextToken() as SyntaxToken<UnaryOperatorKind>;
      const right = this.parseUnaryExpression();
      return new UnaryExpression(this.tree, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.nextToken();
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      return new ParenthesizedExpression(this.tree, left, expression, right);
    }
    return this.parseRangeReference();
  }

  private parseRangeReference() {
    const left = this.parseCellReference();
    if (this.match(SyntaxNodeKind.ColonToken)) {
      this.nextToken();
      const { NumberToken, IdentifierToken } = SyntaxNodeKind;
      if (this.match(IdentifierToken) || this.match(NumberToken)) {
        const right = this.parseCellReference();
        if (right.hasTrivia()) {
          const correctName = right.text;
          this.tree.diagnosticsBag.requireCompactRangeReference(correctName, right.span);
        }
        return new RangeReference(this.tree, left, right);
      }
      const right = this.peekToken();
      this.tree.diagnosticsBag.badRangeFormat(right.span);
      return new RangeReference(this.tree, left, right);
    }
    return left;
  }

  private parseCellReference() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.nextToken() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.nextToken() as SyntaxToken<SyntaxNodeKind.NumberToken>;
      const node = new CellReference(this.tree, left, right);
      if (right.hasTrivia()) {
        this.tree.diagnosticsBag.requireCompactCellReference(node.text, node.span);
      }
      return node;
    }
    return this.parseLiteral();
  }

  private parseLiteral() {
    const token = this.peekToken();
    switch (token.kind) {
      // case TokenKind.TrueToken:
      // case TokenKind.FalseToken:
      case SyntaxNodeKind.IdentifierToken:
      case SyntaxNodeKind.NumberToken:
        return this.nextToken();
    }
    this.tree.diagnosticsBag.unexpectedTokenFound(token.kind, SyntaxNodeKind.Expression, token.span);
    return this.nextToken();
  }

  private peekToken(offset: number = 0) {
    const thisIndex = this.index + offset;
    const lastIndex = this.tokens.length - 1;
    if (thisIndex > lastIndex) return this.tokens[lastIndex];
    return this.tokens[thisIndex];
  }

  private nextToken() {
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
      return this.nextToken() as SyntaxToken<Kind>;
    }
    const token = this.nextToken() as SyntaxToken<Kind>;
    this.tree.diagnosticsBag.unexpectedTokenFound(token.kind, kind, token.span);
    return token as SyntaxToken<Kind>;
  }
}
