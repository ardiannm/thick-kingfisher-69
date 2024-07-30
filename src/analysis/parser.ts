import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { CompositeTokenKind } from "./parser/kind/composite.token.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { SyntaxUnaryOperatorKind } from "./parser/kind/syntax.unary.operator.kind";
import { SyntaxToken } from "./parser/syntax.token";
import { SyntaxBinaryExpression } from "./parser/syntax.binary.expression";
import { UnaryExpression } from "./parser/unary.expression";
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
    const statements = new Array<SyntaxExpression>(this.parseBlock());
    while (this.hasMoreTokens()) {
      statements.push(this.parseBlock());
    }
    return new SyntaxCompilationUnit(this.tree, statements, this.expect(SyntaxNodeKind.EndOfFileToken));
  }

  private parseBlock() {
    if (this.match(SyntaxNodeKind.OpenBraceToken)) {
      const statements = new Array<SyntaxExpression>();
      const openBrace = this.expect(SyntaxNodeKind.OpenBraceToken);
      while (this.hasMoreTokens() && !this.match(SyntaxNodeKind.CloseBraceToken)) {
        statements.push(this.parseBlock());
      }
      var closeBrace: SyntaxToken<SyntaxNodeKind.CloseBraceToken>;
      if (this.tree.diagnostics.hasErrorSince(openBrace)) {
        closeBrace = this.getNextToken() as SyntaxToken<SyntaxNodeKind.CloseBraceToken>;
      } else {
        closeBrace = this.expect(SyntaxNodeKind.CloseBraceToken);
      }
      return new SyntaxBlock(this.tree, openBrace, statements, closeBrace);
    }
    return this.parseCellAssignment();
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    switch (this.peekToken().kind) {
      case CompositeTokenKind.ColonColonToken:
        const keyword = this.getNextToken() as SyntaxToken<CompositeTokenKind.ColonColonToken>;
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
      const operator = this.getNextToken() as SyntaxToken<BinaryOperatorKind>;
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
      return new UnaryExpression(this.tree, operator, right);
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxNodeKind.OpenParenthesisToken)) {
      const left = this.getNextToken();
      const expression = this.parseBinaryExpression();
      var right: SyntaxToken<SyntaxNodeKind.CloseParenthesisToken>;
      if (this.tree.diagnostics.hasErrorSince(left)) {
        right = this.getNextToken() as SyntaxToken<SyntaxNodeKind.CloseParenthesisToken>;
      } else {
        right = this.expect(SyntaxNodeKind.CloseParenthesisToken);
      }
      return new SyntaxParenthesis(this.tree, left, expression, right);
    }
    return this.parseCellReference();
  }

  private parseCellReference() {
    if (this.match(SyntaxNodeKind.IdentifierToken, SyntaxNodeKind.NumberToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxNodeKind.IdentifierToken>;
      const right = this.getNextToken() as SyntaxToken<SyntaxNodeKind.NumberToken>;
      const node = new SyntaxCellReference(this.tree, left, right);
      if (right.hasTrivia()) {
        this.tree.diagnostics.requireCompactCellReference(node.text, node.span);
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
    this.tree.diagnostics.expectingSyntaxExpression(token.span);
    return this.getNextToken();
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
    return true;
  }

  private expect<Kind extends SyntaxKind>(kind: Kind): SyntaxToken<Kind> {
    if (this.match(kind)) {
      return this.getNextToken() as SyntaxToken<Kind>;
    }
    const token = this.getNextToken() as SyntaxToken<Kind>;
    this.tree.diagnostics.unexpectedTokenFound(token.kind, kind, token.span);
    return token as SyntaxToken<Kind>;
  }
}
