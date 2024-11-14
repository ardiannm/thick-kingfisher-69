import { TextSpan } from "../../lexing/text.span";
import { SourceText } from "../../lexing/source.text";
import { BoundKind } from "../binder/bound.kind";
import { Kind } from "../parsing/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { Severity } from "./severity";

export class DiagnosticsBag {
  private diagnostics = [] as Diagnostic[];
  private severity = new Set() as Set<Severity>;

  constructor(public readonly sourceText: SourceText) {}

  private report(message: string, severity: Severity, span: TextSpan) {
    this.severity.add(severity);
    this.diagnostics.push(Diagnostic.createFrom(message, severity, span));
  }

  getDiagnostics(limit?: number) {
    return limit ? this.diagnostics.slice(0, limit) : this.diagnostics;
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

  badCharacterFound(text: string, span: TextSpan) {
    this.report(`Illegal character '${text}' found.`, Severity.Warning, span);
  }

  unexpectedTokenFound(matched: Kind, expecting: Kind, span: TextSpan) {
    this.report(`Unexpected token found: '${matched}' expecting '${expecting}'.`, Severity.CantEvaluate, span);
  }

  missingTripleQuotes(span: TextSpan) {
    this.report(
      `Missing closing triple quotes ('''). It looks like the multi-line string was not properly closed. Please ensure you close the string after your intended text.`,
      Severity.CantBind,
      span
    );
  }

  undeclaredCell(name: string, span: TextSpan) {
    this.report(`Cell reference '${name}' is undeclared.`, Severity.CantEvaluate, span);
  }

  badFloatingPointNumber(span: TextSpan) {
    this.report(`Wrong floating number format.`, Severity.CantBind, span);
  }

  requireCompactCellReference(correctName: string, span: TextSpan) {
    this.report(`Did you mean \`${correctName}\`?`, Severity.CantEvaluate, span);
  }

  emptyBlock(span: TextSpan) {
    this.report(`Expecting statements in the block.`, Severity.CantEvaluate, span);
  }

  binderMethod(kind: Kind, span: TextSpan) {
    this.report(`Method for binding '${kind}' is not implemented.`, Severity.CantBind, span);
  }

  evaluatorMethod(kind: BoundKind, span: TextSpan) {
    this.report(`Method for evaluating '${kind}' is not implemented.`, Severity.CantEvaluate, span);
  }
}
