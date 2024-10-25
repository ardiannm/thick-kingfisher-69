import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { SyntaxCompositeTokenKind } from "./parser/kind/syntax.composite.token.kind";
import { SyntaxBinaryOperatorKind } from "./parser/kind/syntax.binary.operator.kind";
import { SyntaxUnaryOperatorKind } from "./parser/kind/syntax.unary.operator.kind";
import { SyntaxToken } from "./parser/syntax.token";
import { SyntaxBinaryExpression } from "./parser/syntax.binary.expression";
import { SyntaxUnaryExpression } from "./parser/syntax.unary.expression";
import { SyntaxParenthesis } from "./parser/syntax.parenthesis";
import { SyntaxCellReference } from "./parser/syntax.cell.reference";
import { SyntaxFacts } from "./parser/syntax.facts";
import { SyntaxExpression } from "./parser/syntax.expression";
import { SyntaxCompilationUnit } from "./parser/syntax.compilation.unit";
import { SyntaxCellAssignment } from "./parser/syntax.cell.assignment";
import { SyntaxTree } from "../runtime/syntax.tree";
import { Lexer } from "./lexer";
import { SyntaxBlock } from "./parser/syntax.block";

export class Parser {
  private index = 0;
  private tokens = new Array<SyntaxToken<SyntaxKind>>();
  private recovering = false;

  private hasMoreTokens() {
    return !this.match(SyntaxNodeKind.EndOfFileToken);
  }

  private constructor(public readonly tree: SyntaxTree) {
    const lexer = new Lexer(tree);
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = lexer.lex();
      if (token.kind === SyntaxNodeKind.BadToken) continue;
      this.tokens.push(token);
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
  }

  static parseCompilationUnit(tree: SyntaxTree) {
    return new Parser(tree).parseCompilationUnit();
  }

  private parseCompilationUnit() {
    const statements = new Array<SyntaxExpression>(this.parseBlock());
    while (this.hasMoreTokens()) {
      const startToken = this.peekToken();
      statements.push(this.parseBlock());
      if (this.peekToken() === startToken) this.getNextToken();
    }
    return new SyntaxCompilationUnit(this.tree, statements, this.expect(SyntaxNodeKind.EndOfFileToken));
  }

  private parseBlock() {
    if (this.match(SyntaxNodeKind.OpenBraceToken)) {
      const openBrace = this.expect(SyntaxNodeKind.OpenBraceToken);
      const statements = new Array<SyntaxExpression>();
      while (this.hasMoreTokens() && !this.match(SyntaxNodeKind.CloseBraceToken)) {
        const startToken = this.peekToken();
        statements.push(this.parseBlock());
        if (this.peekToken() === startToken) this.getNextToken();
      }
      const closeBrace = this.expect(SyntaxNodeKind.CloseBraceToken);
      const node = new SyntaxBlock(this.tree, openBrace, statements, closeBrace);
      if (closeBrace.kind === SyntaxNodeKind.CloseBraceToken && !statements.length) {
        this.tree.diagnostics.emptyBlock(node.span);
      }
      return node;
    }
    return this.parseCellAssignment();
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    switch (this.peekToken().kind) {
      case SyntaxCompositeTokenKind.ColonColonToken:
        const keyword = this.getNextToken() as SyntaxToken<SyntaxCompositeTokenKind.ColonColonToken>;
        return new SyntaxCellAssignment(this.tree, left, keyword, this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): SyntaxExpression {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.binaryPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.getNextToken() as SyntaxToken<SyntaxBinaryOperatorKind>;
      const right = this.parseBinaryExpression(precedence);
      left = new SyntaxBinaryExpression(this.tree, left, operator, right);
    }
    return left;
  }

  private parseUnaryExpression(): SyntaxExpression {
    const precedence = SyntaxFacts.unaryPrecedence(this.peekToken().kind);
    if (precedence) {
      const operator = this.getNextToken() as SyntaxToken<SyntaxUnaryOperatorKind>;
      const right = this.parseUnaryExpression();
      return new SyntaxUnaryExpression(this.tree, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.getNextToken();
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      return new SyntaxParenthesis(this.tree, left as SyntaxToken<SyntaxNodeKind.OpenParenthesisToken>, expression, right);
    }
    return this.parseCellReference();
  }

  private parseCellReference() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.getNextToken() as SyntaxToken<SyntaxNodeKind.NumberToken>;
      const node = new SyntaxCellReference(this.tree, left, right);
      if (right.hasTrivia()) {
        this.tree.diagnostics.requireCompactCellReference(left.text + right.text, node.span);
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
        return this.getNextToken();
    }
    return this.expect(SyntaxNodeKind.SyntaxExpression);
  }

  private peekToken(offset: number = 0) {
    const thisIndex = this.index + offset;
    const lastIndex = this.tokens.length - 1;
    if (thisIndex > lastIndex) return this.tokens[lastIndex];
    return this.tokens[thisIndex];
  }

  private getNextToken() {
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
    this.recovering = false;
    return true;
  }

  private expect<Kind extends SyntaxKind>(kind: Kind): SyntaxToken<Kind> {
    if (this.match(kind)) {
      return this.getNextToken() as SyntaxToken<Kind>;
    }
    const token = this.peekToken() as SyntaxToken<Kind>;
    if (this.recovering) {
      return token;
    }
    this.recovering = true;
    this.tree.diagnostics.unexpectedTokenFound(token.kind, kind, token.span);
    return token as SyntaxToken<Kind>;
  }
}
