import { SourceText } from "../../lexing/source.text";
import { Kind, SyntaxBinaryOperatorKind, SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
import { SyntaxBinaryExpression } from "./syntax.binary.expression";
import { SyntaxBlock } from "./syntax.block";
import { SyntaxCellAssignment } from "./syntax.cell.assignment";
import { SyntaxCellReference } from "./syntax.cell.reference";
import { SyntaxCompilationUnit } from "./syntax.compilation.unit";
import { SyntaxFacts } from "./syntax.facts";
import { SyntaxNode } from "./syntax.node";
import { SyntaxParenthesis } from "./syntax.parenthesis";
import { SyntaxToken } from "./syntax.token";
import { Token } from "../../lexing/token";
import { SyntaxUnaryExpression } from "./syntax.unary.expression";
import { Severity } from "../diagnostics/severity";
import { Span } from "../../lexing/span";

export class Parser {
  private syntaxTokens = [] as SyntaxToken[];
  private recovering = false;
  private position = 0;

  private constructor(public readonly source: SourceText) {
    let trivias = [] as Token[];
    for (const token of this.source.getTokens()) {
      if (token.isTrivia()) {
        trivias.push(token);
      } else {
        this.syntaxTokens.push(new SyntaxToken(this.source, token.kind, token.span, trivias));
        trivias = [];
      }
    }
  }

  static parseCompilationUnit(sourceText: SourceText) {
    return new Parser(sourceText).parseCompilationUnit();
  }

  private parseCompilationUnit() {
    const statements = [] as SyntaxNode[];
    while (this.hasToken()) {
      const startToken = this.peekToken();
      const statement = this.parseBlock();
      statements.push(statement);
      console.log(statement.kind, statement.text);
      if (this.peekToken() === startToken) this.getNextToken();
    }
    const endOfFileToken = this.expect(SyntaxKind.EndOfFileToken, "expecting `EOF` token.") as SyntaxToken<SyntaxKind.EndOfFileToken>;
    return new SyntaxCompilationUnit(this.source, statements, endOfFileToken);
  }

  private parseBlock() {
    if (this.match(SyntaxKind.OpenBraceToken)) {
      const openBrace = this.getNextToken() as SyntaxToken<SyntaxKind.OpenBraceToken>;
      const statements = [] as SyntaxNode[];
      while (this.hasToken() && !this.match(SyntaxKind.CloseBraceToken)) {
        const startToken = this.peekToken();
        statements.push(this.parseBlock());
        if (this.peekToken() === startToken) this.getNextToken();
      }
      const closeBrace = this.expect(SyntaxKind.CloseBraceToken, "expecting `}`.") as SyntaxToken<SyntaxKind.CloseBraceToken>;
      const node = new SyntaxBlock(this.source, openBrace, statements, closeBrace);
      if (closeBrace.kind === SyntaxKind.CloseBraceToken && !statements.length) {
        this.source.diagnosticsBag.report("expecting at least one expression in the block statement", Severity.CantEvaluate, node.span);
      }
      return node;
    }
    return this.parseCellAssignment();
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    if (this.match(SyntaxKind.ColonColonToken)) {
      const keyword = this.getNextToken();
      return new SyntaxCellAssignment(this.source, left as SyntaxCellReference, keyword, this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): SyntaxNode {
    let left = this.parseUnaryExpression();
    while (true) {
      const precedence = SyntaxFacts.getBinaryPrecedence(this.peekToken().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      const operator = this.getNextToken() as SyntaxToken<SyntaxBinaryOperatorKind>;
      const peek = this.peekToken();
      if (peek.span.from.line > operator.span.from.line) {
        const token = this.createErrorToken(operator.span.end);
        this.source.diagnosticsBag.report("missing operand after `" + operator.text + "`.", Severity.CantEvaluate, token.span);
        return new SyntaxBinaryExpression(this.source, left, operator, token);
      } else {
        left = new SyntaxBinaryExpression(this.source, left, operator, this.parseBinaryExpression(precedence));
      }
    }
    return left;
  }

  private parseUnaryExpression(): SyntaxNode {
    const precedence = SyntaxFacts.getUnaryPrecedence(this.peekToken().kind);
    if (precedence) {
      const operator = this.getNextToken() as SyntaxToken<SyntaxUnaryOperatorKind>;
      const peek = this.peekToken();
      if (peek.span.from.line > operator.span.from.line) {
        const token = this.createErrorToken(operator.span.end);
        this.source.diagnosticsBag.report("missing operand after `" + operator.text + "`.", Severity.CantEvaluate, token.span);
        return new SyntaxUnaryExpression(this.source, operator, token);
      } else {
        return new SyntaxUnaryExpression(this.source, operator, this.parseUnaryExpression());
      }
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxKind.OpenParenthesisToken>;
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxKind.CloseParenthesisToken, "expecting `)`.") as SyntaxToken<SyntaxKind.CloseParenthesisToken>;
      return new SyntaxParenthesis(this.source, left, expression, right);
    }
    return this.parseCellReference();
  }

  private parseCellReference() {
    if (this.match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxKind.IdentifierToken>;
      const right = this.getNextToken() as SyntaxToken<SyntaxKind.NumberToken>;
      const node = new SyntaxCellReference(this.source, left, right);
      if (right.hasTrivia()) {
        this.source.diagnosticsBag.reportCompactCellReferenceRequired(left.text + right.text, node.span);
      }
      return node;
    }
    return this.parseLiteral();
  }

  private parseLiteral() {
    const token = this.peekToken();
    switch (token.kind) {
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
        return this.getNextToken();
    }
    return this.expect(SyntaxKind.SyntaxExpression, "unexpected token `" + (token.text || "EOF") + "`.");
  }

  private hasToken() {
    return !this.match(SyntaxKind.EndOfFileToken);
  }

  private peekToken(offset: number = 0) {
    const thisIndex = this.position + offset;
    const lastIndex = this.syntaxTokens.length - 1;
    if (thisIndex > lastIndex) return this.syntaxTokens[lastIndex];
    return this.syntaxTokens[thisIndex];
  }

  private getNextToken() {
    const token = this.peekToken();
    this.position++;
    return token;
  }

  private match(...kinds: Kind[]) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== this.peekToken(offset).kind) return false;
      offset++;
    }
    this.recovering = false;
    return true;
  }

  private expect<K extends Kind = Kind>(kind: K = SyntaxKind.SyntaxExpression as K, message: string, severity: Severity = Severity.CantEvaluate): SyntaxToken<Kind> {
    if (this.match(kind)) {
      return this.getNextToken();
    }
    let peek = this.peekToken();
    const token = new SyntaxToken(this.source, SyntaxKind.SyntaxErrorExpression, peek.span);
    if (this.recovering) {
      return token;
    }
    this.recovering = true;
    this.source.diagnosticsBag.report(message, severity, token.span);
    return token as SyntaxToken<Kind>;
  }

  private createErrorToken(position: number) {
    const line = this.source.getLine(position);
    const span = Span.createFrom(this.source, position, line.span.end);
    return new SyntaxToken(this.source, SyntaxKind.SyntaxErrorExpression, span);
  }
}
