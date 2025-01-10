import { SourceText, SyntaxKind, SyntaxNode } from "../..";
import { DependencyLink } from "../phase/binding/bound.cell.assignment";
import { BoundKind } from "../phase/binding/bound.kind";
import { Span } from "../phase/lexing/span";
import { SyntaxToken } from "../phase/lexing/syntax.token";
import { Diagnostic } from "./diagnostic";
import { Severity } from "./severity";

export class DiagnosticsBag {
  bag = [] as Diagnostic[];
  private severity = new Set() as Set<Severity>;

  canParse() {
    return !this.severity.has(Severity.CantParse);
  }

  canBind() {
    return this.canParse() && !this.severity.has(Severity.CantBind);
  }

  report(message: string, severity: Severity, span: Span) {
    this.severity.add(severity);
    this.bag.push(Diagnostic.createFrom(message, severity, span));
  }

  canEvaluate() {
    return this.canBind() && !this.severity.has(Severity.CantEvaluate);
  }

  reportBadCharacterFound(text: string, span: Span) {
    this.report(`invalid character \`${text}\``, Severity.CantBind, span);
  }

  reportUndeclaredCell(name: string, span: Span) {
    this.report(`cell reference \`${name}\` is undeclared.`, Severity.CantEvaluate, span);
  }

  reportBadFloatingPointNumber(span: Span) {
    this.report(`wrong floating number format.`, Severity.CantBind, span);
  }

  reportExpectedInParenthesis(source: SourceText, start: number, end: number) {
    this.report(`expected expression.`, Severity.CantEvaluate, Span.createFrom(source, start, end));
  }

  reportExpectedClosingParenthesis(node: SyntaxNode) {
    this.report(`expected closing \`)\`.`, Severity.CantEvaluate, Span.createFrom(node.source, node.span.end, node.span.end));
  }

  reportCircularDependencyDetected(span: Span, path: DependencyLink[]) {
    const text = path.map((node) => `${node.node.store.name}`).join(" > ");
    const node = Diagnostic.createFrom(`circular dependency detected. ${text}.`, Severity.CantEvaluate, span);
    this.bag.push(node);
  }

  reportUnexpectedEndOfLine(token: SyntaxToken) {
    const line = token.span.source.getLine(token.span.start);
    const span = Span.createFrom(token.span.source, token.span.end, Math.max(token.span.end, line.span.end));
    this.report(`expected expression.`, Severity.CantEvaluate, span);
  }

  reportUnexpectedTokenFound(span: Span) {
    this.report(`unexpected token \`${span.text}\`.`, Severity.CantEvaluate, span);
  }

  reportCantAssignTo(kind: SyntaxKind, span: Span) {
    this.report(`can't assign to \`${SyntaxKind[kind]}\`.`, Severity.CantEvaluate, span);
  }

  reportMissingBinderMethod(kind: SyntaxKind, span: Span) {
    this.report(`method for binding \`${SyntaxKind[kind]}\` is not implemented.`, Severity.CantBind, span);
  }

  reportMissingEvaluatorMethod(kind: BoundKind, span: Span) {
    this.report(`method for evaluating \`${BoundKind[kind]}\` is not implemented.`, Severity.CantEvaluate, span);
  }
}
