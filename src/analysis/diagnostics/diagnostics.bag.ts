import { Cell } from "../../runtime/cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { SourceText } from "../text/source.text";
import { Span } from "../text/span";
import { Diagnostic } from "./diagnostic";
import { Severity } from "./severity";

export class DiagnosticsBag {
  constructor(private text: SourceText) {}

  private diagnostics = new Array<Diagnostic>();
  private severity = new Set<Severity>();

  private report(message: string, severity: Severity, span: Span) {
    this.severity.add(severity);
    this.diagnostics.push(Diagnostic.createFrom(this.text, message, severity, span));
  }

  canBind() {
    return !this.severity.has(Severity.CantBind);
  }

  canEvaluate() {
    return this.canBind() && !this.severity.has(Severity.CantEvaluate);
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  badCharacterFound(text: string, span: Span) {
    return this.report(`Illegal character '${text}' found.`, Severity.Warning, span);
  }

  unexpectedTokenFound(matched: SyntaxKind, expecting: SyntaxKind, span: Span) {
    return this.report(`Unexpected token found: '${matched}' expecting '${expecting}'.`, Severity.CantBind, span);
  }

  cantDivideByZero(span: Span) {
    return this.report(`Can't divide by zero.`, Severity.Warning, span);
  }

  circularDependency(reference: string, dependency: string, span: Span) {
    return this.report(`Circular dependency '${dependency}' detected while binding '${reference}'.`, Severity.CantEvaluate, span);
  }

  cantUseAsAReference(unexpected: SyntaxKind, span: Span) {
    return this.report(`'${unexpected}' is not assignable to a cell reference.`, Severity.CantEvaluate, span);
  }

  undeclaredCell(cellName: string, span: Span) {
    return this.report(`Cell reference '${cellName}' is undeclared.`, Severity.CantEvaluate, span);
  }

  badFloatingPointNumber(span: Span) {
    return this.report(`Wrong floating number format.`, Severity.CantBind, span);
  }

  autoDeclaredCell(reference: Cell, dependency: Cell, span: Span) {
    return this.report(`Reference '${reference.name}' has been declared automatically after being referenced by '${dependency.name}'.`, Severity.Warning, span);
  }

  requireCompactCellReference(correctName: string, span: Span) {
    return this.report(`Not a valid cell reference. Did you mean '${correctName}'?`, Severity.CantBind, span);
  }

  requireCompactRangeReference(correctName: string, span: Span) {
    return this.report(`Not a valid range reference. Did you mean '${correctName}'?`, Severity.CantBind, span);
  }

  badRangeFormat(span: Span) {
    return this.report(`Not a valid range reference. Expecting a cell reference, row or column.`, Severity.CantBind, span);
  }

  binderMethod(kind: SyntaxKind, span: Span) {
    return this.report(`Method for binding '${kind}' is not implemented.`, Severity.CantBind, span);
  }

  evaluatorMethod(kind: BoundKind) {
    return this.report(`Method for evaluating '${kind}' is not implemented.`, Severity.CantEvaluate, Span.createFrom(0, 1));
  }
}
