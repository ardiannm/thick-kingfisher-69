import { Kind, SyntaxBinaryOperatorKind, SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
import { SyntaxBinaryExpression } from "./syntax.binary.expression";
import { SyntaxCellAssignment } from "./syntax.cell.assignment";
import { SyntaxCellReference } from "./syntax.cell.reference";
import { SyntaxCompilationUnit } from "./syntax.compilation.unit";
import { SyntaxFacts } from "./syntax.facts";
import { SyntaxNode } from "./syntax.node";
import { SyntaxParenthesis } from "./syntax.parenthesis";
import { SyntaxToken } from "../lexing/syntax.token";
import { SyntaxUnaryExpression } from "./syntax.unary.expression";
import { SourceText } from "../lexing/source.text";
import { Span } from "../lexing/span";

export class Parser {
  private position = 0;

  // TODO: Implement on-demand token buffering when Parser.peekToken is invoked.
  private constructor(public readonly source: SourceText) {}

  static parseCompilationUnit(sourceText: SourceText) {
    return new Parser(sourceText).parseCompilationUnit();
  }

  private parseCompilationUnit() {
    const statements = [] as SyntaxNode[];
    while (!this.match(SyntaxKind.EndOfFileToken)) {
      const token = this.peekToken();
      statements.push(this.parseCellAssignment());
      if (this.peekToken() === token) this.getNextToken();
    }
    return new SyntaxCompilationUnit(statements, this.getNextToken());
  }

  private parseCellAssignment() {
    const left = this.parseBinaryExpression();
    if (this.match(SyntaxKind.ColonColonToken)) {
      return new SyntaxCellAssignment(left, this.getNextToken(), this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parent = 0): SyntaxNode {
    let left = this.parseUnaryExpression();
    do {
      const precedence = SyntaxFacts.getBinaryPrecedence(this.peekToken().kind);
      if (!precedence || parent >= precedence || this.peekNextLine()) {
        return left;
      }
      const operator = this.getNextToken<SyntaxBinaryOperatorKind>();
      if (this.peekNextLine(true)) {
        return new SyntaxBinaryExpression(left, operator, this.parseErrorToken());
      } else {
        left = new SyntaxBinaryExpression(left, operator, this.parseBinaryExpression(precedence));
      }
    } while (true);
  }

  private parseErrorToken(): SyntaxNode<Kind> {
    const node = this.peekToken();
    const span = Span.createFrom(this.source, node.span.end, node.span.end);
    return new SyntaxToken<SyntaxKind.SyntaxError>(this.source, SyntaxKind.SyntaxError, span);
  }

  private parseUnaryExpression(): SyntaxNode {
    const operators: SyntaxToken<SyntaxUnaryOperatorKind>[] = [];
    let nextLine = false;
    while (SyntaxFacts.getUnaryPrecedence(this.peekToken().kind)) {
      operators.push(this.getNextToken());
      if (this.peekNextLine(true)) {
        nextLine = true;
        break;
      }
    }
    let right = nextLine ? this.parseErrorToken() : (this.parseParenthesis() as SyntaxNode);
    while (operators.length) right = new SyntaxUnaryExpression(operators.pop()!, right);
    return right;
  }

  // TODO: Stop parsing once the next token is in the next line, throw an "unexpected end of line" for the right hand side
  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      return new SyntaxParenthesis(this.getNextToken(), this.parseBinaryExpression(), this.getNextToken());
    }
    return this.parseCellReference();
  }

  private parseCellReference() {
    if (!this.peekToken(1).hasTrivia() && this.match(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      return new SyntaxCellReference(this.getNextToken(), this.getNextToken());
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
    return this.parseErrorToken();
  }

  private peekToken<K extends Kind = Kind>(offset: number = 0): SyntaxToken<K> {
    let next = this.position + offset;
    const tokens = this.source.tokens;
    if (next < 0) next = 0;
    if (next >= tokens.length) next = tokens.length - 1;
    let token: SyntaxToken = tokens[next];
    while (token.isTrivia()) {
      next++;
      token = tokens[next];
    }
    return token as SyntaxToken<K>;
  }

  private getNextToken<K extends Kind = Kind>(): SyntaxToken<K> {
    const token = this.peekToken<K>();
    this.position = token.position + 1;
    return token;
  }

  private match(...kinds: Kind[]) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== this.peekToken(offset).kind) return false;
      offset++;
    }
    return true;
  }

  private peekNextLine(report = false) {
    const token = this.peekToken(-1);
    const peek = this.peekToken(0);
    const nextLine = peek.span.to.line > token.span.to.line || peek.kind === SyntaxKind.EndOfFileToken;
    if (nextLine && report) {
      const line = this.source.getLine(token.span.start);
      const span = Span.createFrom(this.source, token.span.end, Math.max(token.span.end, line.span.end));
      this.source.diagnosticsBag.reportUnexpectedEndOfLine(span);
    }
    return nextLine;
  }
}
