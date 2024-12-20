import { Kind, SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind";
import { SyntaxBinaryExpression } from "./syntax.binary.expression";
import { SyntaxCellAssignment } from "./syntax.cell.assignment";
import { SyntaxCellReference } from "./syntax.cell.reference";
import { SyntaxCompilationUnit } from "./syntax.compilation.unit";
import { SyntaxFacts } from "./syntax.facts";
import { SyntaxNode } from "./syntax.node";
import { SyntaxParenthesis } from "./syntax.parenthesis";
import { SyntaxToken } from "./syntax.token";
import { SyntaxUnaryExpression } from "./syntax.unary.expression";
import { SourceText } from "../lexing/source.text";
import { Token } from "../lexing/token";

export class Parser {
  private tokens: SyntaxToken<Kind>[] = [];
  private position = 0;

  // TODO: Implement on-demand token buffering when Parser.peekToken is invoked.
  private constructor(public readonly source: SourceText) {
    let trivias: Token[] = [];
    for (const token of this.source.getTokens()) {
      if (token.isTrivia()) {
        trivias.push(token);
      } else {
        this.tokens.push(new SyntaxToken(this.source, token.kind, token.span, trivias));
        trivias = [];
      }
    }
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
    if (this.match(SyntaxKind.ColonColonToken)) {
      return new SyntaxCellAssignment(left, this.getNextToken(), this.parseBinaryExpression());
    }
    return left;
  }

  private parseBinaryExpression(parent = 0): SyntaxNode {
    let left = this.parseUnaryExpression();
    do {
      const precedence = SyntaxFacts.getBinaryPrecedence(this.peekToken().kind);
      if (!precedence || parent >= precedence) {
        return left;
      }
      left = new SyntaxBinaryExpression(left, this.getNextToken(), this.parseBinaryExpression(precedence));
    } while (true);
  }

  private parseUnaryExpression(): SyntaxNode {
    const operators: SyntaxToken<SyntaxUnaryOperatorKind>[] = [];
    while (SyntaxFacts.getUnaryPrecedence(this.peekToken().kind)) {
      operators.push(this.getNextToken());
    }
    let right = this.parseParenthesis() as SyntaxNode;
    while (operators.length) {
      right = new SyntaxUnaryExpression(operators.pop()!, right);
    }
    return right;
  }

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
    return token;
  }

  private peekToken<K extends Kind = Kind>(offset: number = 0): SyntaxToken<K> {
    let next = this.position + offset;
    if (next < 0) next = 0;
    if (next >= this.tokens.length) next = this.tokens.length - 1;
    return this.tokens[next] as SyntaxToken<K>;
  }

  private getNextToken<K extends Kind = Kind>(): SyntaxToken<K> {
    const token = this.peekToken<K>();
    this.position++;
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
}
