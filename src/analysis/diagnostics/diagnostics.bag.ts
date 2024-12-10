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

  badCharacterFound(text: string, span: Span) {
    this.report(`bad character \`${text}\` found`, Severity.CantBind, span);
  }

  unexpectedTokenFound(matched: Kind, expecting: Kind, span: Span) {
    this.report(`unexpected token found: \`${matched}\` expecting \`${expecting}\`.`, Severity.CantEvaluate, span);
  }

  undeclaredCell(name: string, span: Span) {
    this.report(`cell reference \`${name}\` is undeclared.`, Severity.CantEvaluate, span);
  }

  badFloatingPointNumber(span: Span) {
    this.report(`wrong floating number format.`, Severity.CantBind, span);
  }

  missingClosingQuote(span: Span) {
    this.report(`comment is missing a closing \`"\``, Severity.CantParse, span);
  }

  requireCompactCellReference(correctName: string, span: Span) {
    this.report(`did you mean \`${correctName}\`?`, Severity.CantEvaluate, span);
  }

  emptyBlock(span: Span) {
    this.report(`expecting statements in the block.`, Severity.CantEvaluate, span);
  }

  circularDependencyDetected(span: Span, path: DependencyLink[]) {
    const text = path.map((n) => `${n.node.reference.name}`).join(" > ");
    const node = Diagnostic.createFrom(`circular dependency detected. ${text}.`, Severity.CantEvaluate, span);
    this.diagnostics.push(node);
  }

  binderMethod(kind: Kind, span: Span) {
    this.report(`method for binding \`${kind}\` is not implemented.`, Severity.CantBind, span);
  }

  evaluatorMethod(kind: BoundKind, span: Span) {
    this.report(`method for evaluating \`${kind}\` is not implemented.`, Severity.CantEvaluate, span);
  }
}
