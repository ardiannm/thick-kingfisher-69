import { Span } from "../../lexing/span";
import { DependencyLink } from "../binding/bound.cell.assignment";
import { BoundKind } from "../binding/bound.kind";
import { Kind } from "../parsing/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { Severity } from "./severity";

export class DiagnosticsBag {
  diagnostics = [] as Diagnostic[];
  private severity = new Set() as Set<Severity>;

  private report(message: string, severity: Severity, span: Span) {
    this.severity.add(severity);
    this.diagnostics.push(Diagnostic.createFrom(message, severity, span));
  }

  canParse() {
    return !this.severity.has(Severity.CantParse);
  }

  canBind() {
    return this.canParse() && !this.severity.has(Severity.CantBind);
  }

  canEvaluate() {
    return this.canBind() && !this.severity.has(Severity.CantEvaluate);
  }

  reportBadCharacterFound(text: string, span: Span) {
    this.report(`bad character \`${text}\` found`, Severity.CantBind, span);
  }

  reportExpectingSyntax(kind: Kind, span: Span) {
    this.report(`expecting \`${kind}\`.`, Severity.CantEvaluate, span);
  }

  reportUndeclaredCell(name: string, span: Span) {
    this.report(`cell reference \`${name}\` is undeclared.`, Severity.CantEvaluate, span);
  }

  reportBadFloatingPointNumber(span: Span) {
    this.report(`wrong floating number format.`, Severity.CantBind, span);
  }

  reportMissingClosingQuote(span: Span) {
    this.report(`comment is missing a closing \`"\``, Severity.CantParse, span);
  }

  reportCompactCellReferenceRequired(correctName: string, span: Span) {
    this.report(`did you mean \`${correctName}\`?`, Severity.CantEvaluate, span);
  }

  reportEmptyBlock(span: Span) {
    this.report(`expecting statements in the block.`, Severity.CantEvaluate, span);
  }

  reportCircularDependencyDetected(span: Span, path: DependencyLink[]) {
    const text = path.map((n) => `${n.node.reference.name}`).join(" > ");
    const node = Diagnostic.createFrom(`circular dependency detected. ${text}.`, Severity.CantEvaluate, span);
    this.diagnostics.push(node);
  }

  reportCantAssignTo(kind: Kind, span: Span) {
    this.report(`can't assign to \`${kind}\`.`, Severity.CantEvaluate, span);
  }

  reportMissingBinderMethod(kind: Kind, span: Span) {
    this.report(`method for binding \`${kind}\` is not implemented.`, Severity.CantBind, span);
  }

  reportMissingEvaluatorMethod(kind: BoundKind, span: Span) {
    this.report(`method for evaluating \`${kind}\` is not implemented.`, Severity.CantEvaluate, span);
  }
}
