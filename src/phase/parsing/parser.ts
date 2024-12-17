import { Kind, SyntaxBinaryOperatorKind, SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
import { SyntaxBinaryExpression } from "./syntax.binary.expression";
import { SyntaxCellAssignment } from "./syntax.cell.assignment";
import { SyntaxCellReference } from "./syntax.cell.reference";
import { SyntaxCompilationUnit } from "./syntax.compilation.unit";
import { SyntaxFacts } from "./syntax.facts";
import { SyntaxNode } from "./syntax.node";
import { SyntaxParenthesis } from "./syntax.parenthesis";
import { SyntaxToken } from "./syntax.token";
import { SyntaxUnaryExpression } from "./syntax.unary.expression";
import { Severity } from "../../diagnostics/severity";
import { SourceText } from "../lexing/source.text";
import { Span } from "../lexing/span";
import { Token } from "../lexing/token";

export class Parser {
  private syntaxTokens = [] as SyntaxToken[];
  private position = 0;
  private recovering = false;

  // TODO: Implement on-demand token buffering when Parser.peekToken is invoked.
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
      const statement = this.parseCellAssignment();
      statements.push(statement);
      if (this.peekToken() === startToken) this.getNextToken();
    }
    const token = this.expect(SyntaxKind.EndOfFileToken, "expected the end of file token") as SyntaxToken<SyntaxKind.EndOfFileToken>;
    return new SyntaxCompilationUnit(this.source, statements, token);
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    if (this.match(SyntaxKind.ColonColonToken)) {
      return new SyntaxCellAssignment(this.source, left as SyntaxCellReference, this.getNextToken(), this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parentPrecedence = 0): SyntaxNode {
    let left = this.parseUnaryExpression();
    while (true) {
      let peek = this.peekToken();
      const precedence = SyntaxFacts.getBinaryPrecedence(peek.kind);
      if (!precedence || parentPrecedence >= precedence || this.peekNextLine()) {
        break;
      }
      const operator = this.getNextToken() as SyntaxToken<SyntaxBinaryOperatorKind>;
      if (this.peekNextLine("expected expression")) {
        return left;
      }
      left = new SyntaxBinaryExpression(this.source, left, operator, this.parseBinaryExpression(precedence));
    }
    return left;
  }

  // TODO: Refactor this method to replace the recursive solution with a while loop
  private parseUnaryExpression(): SyntaxNode {
    const precedence = SyntaxFacts.getUnaryPrecedence(this.peekToken().kind);
    if (precedence) {
      const operator = this.getNextToken() as SyntaxToken<SyntaxUnaryOperatorKind>;
      if (this.peekNextLine("expected expression")) {
        return this.parseErrorToken(operator);
      }
      return new SyntaxUnaryExpression(this.source, operator, this.parseUnaryExpression());
    }
    return this.parseParenthesis();
  }

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxKind.OpenParenthesisToken>;
      const expression = this.parseBinaryExpression();
      const right = this.expect(SyntaxKind.CloseParenthesisToken, "expecting `)`") as SyntaxToken<SyntaxKind.CloseParenthesisToken>;
      return new SyntaxParenthesis(this.source, left, expression, right);
    }
    return this.parseCellReference();
  }

  private parseCellReference() {
    if (!this.peekToken(1).hasTrivia() && this.match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const left = this.getNextToken() as SyntaxToken<SyntaxKind.IdentifierToken>;
      const right = this.getNextToken() as SyntaxToken<SyntaxKind.NumberToken>;
      return new SyntaxCellReference(this.source, left, right);
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
    const text = token.span.text;
    return this.expect(SyntaxKind.Expression, text ? "unexpected token `" + text + "`" : "expected expression");
  }

  private parseErrorToken(token: SyntaxNode) {
    return new SyntaxToken(this.source, SyntaxKind.SyntaxError, Span.createFrom(this.source, token.span.end, token.span.end));
  }

  private hasToken() {
    return !this.match(SyntaxKind.EndOfFileToken);
  }

  private peekToken(offset: number = 0) {
    const thisIndex = this.position + offset;
    const lastIndex = this.syntaxTokens.length - 1;
    if (thisIndex > lastIndex) {
      return this.syntaxTokens[lastIndex];
    } else if (thisIndex < 0) {
      return this.syntaxTokens[0];
    }
    return this.syntaxTokens[thisIndex];
  }

  private peekNextLine(message?: string) {
    const peek = this.peekToken();
    const prevToken = this.peekToken(-1);
    if (peek.span.to.line > prevToken.span.from.line) {
      if (message) {
        const start = prevToken.span.end;
        const end = Math.min(this.source.getLine(start).span.end, peek.span.start);
        this.source.diagnosticsBag.report(message, Severity.CantEvaluate, Span.createFrom(this.source, start, end));
      }
      return true;
    }
    return false;
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

  private expect<K extends Kind = Kind>(kind: K, message: string): SyntaxToken<Kind> {
    const nextToken = this.peekToken();
    if (this.match(kind)) {
      return this.getNextToken();
    }
    const errorToken = this.parseErrorToken(nextToken);
    if (this.recovering) {
      return errorToken;
    }
    this.recovering = true;
    this.source.diagnosticsBag.report(message, Severity.CantEvaluate, nextToken.span);
    return errorToken as SyntaxToken<K>;
  }
}
