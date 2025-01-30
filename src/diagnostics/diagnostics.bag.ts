import { SyntaxKind, SyntaxNode } from "../.."
import { BoundKind } from "../phases/binding/bound.kind"
import { Span } from "../phases/lexing/span"
import { SyntaxToken } from "../phases/lexing/syntax.token"
import { Diagnostic } from "./diagnostic"
import { Severity } from "./severity"

export class DiagnosticsBag {
  bag = [] as Diagnostic[]
  private severity = new Set() as Set<Severity>

  canParse() {
    return !this.severity.has(Severity.CantParse)
  }

  canBind() {
    return this.canParse() && !this.severity.has(Severity.CantBind)
  }

  report(message: string, severity: Severity, span: Span) {
    this.severity.add(severity)
    this.bag.push(Diagnostic.create(message, severity, span))
  }

  canEvaluate() {
    return this.canBind() && !this.severity.has(Severity.CantEvaluate)
  }

  reportBadCharacterFound(text: string, span: Span) {
    this.report("invalid character `" + text + "`", Severity.CantBind, span)
  }

  reportUndeclaredCell(name: string, span: Span) {
    this.report("cell reference `" + name + "` is undeclared.", Severity.CantEvaluate, span)
  }

  reportBadFloatingPointNumber(span: Span) {
    this.report(`wrong floating number format.`, Severity.CantBind, span)
  }

  reportExpectedInParenthesis(start: number, end: number) {
    this.report(`expected expression.`, Severity.CantEvaluate, Span.create(start, end))
  }

  reportExpectedClosingParenthesis(node: SyntaxNode) {
    this.report(`expected closing \`)\`.`, Severity.CantEvaluate, Span.create(node.span.end, node.span.end))
  }

  reportCircularDependencyDetected(span: Span, path: string) {
    const node = Diagnostic.create(`circular dependency detected. ${path}.`, Severity.CantEvaluate, span)
    this.bag.push(node)
  }

  reportUnexpectedEndOfLine(token: SyntaxToken) {
    const line = token.source.getLine(token.span.start)
    const span = Span.create(token.span.end, Math.max(token.span.end, line.span.end))
    this.report(`expected expression.`, Severity.CantEvaluate, span)
  }

  reportUnexpectedTokenFound(text: string, span: Span) {
    this.report(`unexpected token \`${text}\`.`, Severity.CantEvaluate, span)
  }

  reportCantAssignTo(kind: SyntaxKind, span: Span) {
    this.report(`can't assign to \`${SyntaxKind[kind]}\`.`, Severity.CantEvaluate, span)
  }

  reportMissingBinderMethod(kind: SyntaxKind, span: Span) {
    this.report(`method for binding \`${SyntaxKind[kind]}\` is not implemented.`, Severity.CantBind, span)
  }

  reportMissingEvaluatorMethod(kind: BoundKind, span: Span) {
    this.report(`method for evaluating \`${BoundKind[kind]}\` is not implemented.`, Severity.CantEvaluate, span)
  }
}
