import { SyntaxBinaryOperatorKind, SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
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
  private tokens: SyntaxToken[] = [];
  private position = 0;

  private constructor(public readonly source: SourceText) {
    for (const token of this.source.tokens) if (!token.isTrivia()) this.tokens.push(token);
  }

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
    if (this.match(SyntaxKind.EqualsToken) && !this.peekNextLine()) {
      const operator = this.getNextToken();
      if (this.peekNextLine(true)) {
        return new SyntaxCellAssignment(left, operator, this.parseErrorToken());
      } else {
        return new SyntaxCellAssignment(left, operator, this.parseBinaryExpression());
      }
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

  private parseParenthesis() {
    if (this.match(SyntaxKind.OpenParenthesisToken)) {
      const left = this.getNextToken<SyntaxKind.OpenParenthesisToken>();
      if (this.match(SyntaxKind.CloseParenthesisToken) || this.match(SyntaxKind.EndOfFileToken)) {
        const errorToken = this.parseErrorToken();
        const right = this.getNextToken<SyntaxKind.CloseParenthesisToken>();
        this.source.diagnostics.reportExpectedInParenthesis(this.source, left.span.end, right.span.start);
        return new SyntaxParenthesis(left, errorToken, right);
      }
      const expression = this.parseBinaryExpression();
      let right: SyntaxToken<SyntaxKind.CloseParenthesisToken>;
      if (this.match(SyntaxKind.CloseParenthesisToken)) {
        right = this.getNextToken();
      } else {
        right = this.parseErrorToken();
        this.source.diagnostics.reportExpectedClosingParenthesis(expression);
      }
      return new SyntaxParenthesis(left, expression, right);
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
    this.source.diagnostics.reportUnexpectedTokenFound(token.span);
    return this.parseErrorToken();
  }

  private parseErrorToken<K extends SyntaxKind = SyntaxKind>() {
    const node = this.peekToken();
    const span = Span.createFrom(this.source, node.span.end, node.span.end);
    return new SyntaxToken<K>(this.source, SyntaxKind.SyntaxError as K, span);
  }

  private peekToken<K extends SyntaxKind = SyntaxKind>(offset: number = 0): SyntaxToken<K> {
    if (offset < 0) offset = 0;
    let next = this.position + offset;
    if (next < 0) next = 0;
    if (next >= this.tokens.length) next = this.tokens.length - 1;
    return this.tokens[next] as SyntaxToken<K>;
  }

  private getNextToken<K extends SyntaxKind = SyntaxKind>(): SyntaxToken<K> {
    const token = this.peekToken<K>();
    this.position++;
    return token;
  }

  private match(...kinds: SyntaxKind[]) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== this.peekToken(offset).kind) return false;
      offset++;
    }
    return true;
  }

  private peekNextLine(report = false) {
    const token = this.tokens[this.position - 1 > 0 ? this.position - 1 : this.position];
    const peek = this.peekToken();
    const nextLine = peek.span.to.line > token.span.to.line || peek.kind === SyntaxKind.EndOfFileToken;
    if (nextLine && report) {
      this.source.diagnostics.reportUnexpectedEndOfLine(token);
    }
    return nextLine;
  }
}
