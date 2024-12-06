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
    this.report(`Bad character \`${text}\` found`, Severity.CantBind, span);
  }

  unexpectedTokenFound(matched: Kind, expecting: Kind, span: Span) {
    this.report(`Unexpected token found: \`${matched}\` expecting \`${expecting}\`.`, Severity.CantEvaluate, span);
  }

  undeclaredCell(name: string, span: Span) {
    this.report(`Cell reference \`${name}\` is undeclared.`, Severity.CantEvaluate, span);
  }

  badFloatingPointNumber(span: Span) {
    this.report(`Wrong floating number format.`, Severity.CantBind, span);
  }

  missingClosingQuote(span: Span) {
    this.report(`Comment is missing a closing \`"\``, Severity.CantParse, span);
  }

  requireCompactCellReference(correctName: string, span: Span) {
    this.report(`Did you mean \`${correctName}\`?`, Severity.CantEvaluate, span);
  }

  emptyBlock(span: Span) {
    this.report(`Expecting statements in the block.`, Severity.CantEvaluate, span);
  }

  circularDependencyDetected(name: string, span: Span, path: DependencyLink[]) {
    const text = path.map((n) => `${n.node.reference.name}`).join(" > ");
    const node = Diagnostic.createFrom(`Circular dependency detected in \`${name}\`.\n\t\t${text}`, Severity.CantEvaluate, span);
    this.diagnostics.push(node);
  }

  binderMethod(kind: Kind, span: Span) {
    this.report(`Method for binding \`${kind}\` is not implemented.`, Severity.CantBind, span);
  }

  evaluatorMethod(kind: BoundKind, span: Span) {
    this.report(`Method for evaluating \`${kind}\` is not implemented.`, Severity.CantEvaluate, span);
  }
}
