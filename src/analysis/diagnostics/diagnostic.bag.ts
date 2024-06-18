import { Cell } from "../../cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { DiagnosticSeverity } from "./diagnostic.severity";

export class DiagnosticBag {
  private other = new Array<Diagnostic>();
  private error = new Array<Diagnostic>();

  none() {
    return !(this.error.length > 0);
  }

  get() {
    return [...this.other, ...this.error];
  }

  merge(diagnostics: DiagnosticBag) {
    for (const d of diagnostics.get()) this.add(d);
  }

  add(diagnostic: Diagnostic) {
    switch (diagnostic.severity) {
      case DiagnosticSeverity.Error:
      case DiagnosticSeverity.Error:
        this.error.push(diagnostic);
        break;
      case DiagnosticSeverity.Warning:
      case DiagnosticSeverity.Informative:
        this.other.push(diagnostic);
        break;
    }
  }

  clear() {
    this.other.length = 0;
    this.error.length = 0;
  }

  badTokenFound(text: string) {
    const message = `Bad character '${text}' found`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  tokenMissmatch(matched: SyntaxKind, expectedKind: SyntaxKind) {
    const message = `Unexpected '${matched}' found, expecting '${expectedKind}'`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  emptyProgram() {
    const message = `Program contains no code`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  cantDivideByZero() {
    const message = `Can't divide by zero`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  circularDependency(observer: Cell) {
    const message = `Circular dependency detected in '${observer.name}'`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  cantUseAsAReference(unexpected: SyntaxKind) {
    const message = `'${unexpected}' is not assignable to a cell reference`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  undeclaredCell(cellName: string) {
    const message = `Cell reference '${cellName}' is undeclared`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  badFloatingPointNumber() {
    const message = `Wrong floating number format`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  invalidCellState(subject: Cell) {
    const message = `Reference '${subject.name}' is in an invalid state`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  autoDeclaredCell(subject: Cell, cell: Cell) {
    const message = `Reference '${subject.name}' has been declared automatically after being referenced by '${cell.name}'`;
    return this.add(new Diagnostic(DiagnosticSeverity.Informative, message));
  }

  wrongCellNameFormat(didYouMean: string) {
    const message = `Did you mean '${didYouMean}'?`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  binderMethod(kind: SyntaxKind) {
    const message = `Binder: Method for '${kind}' is not implemented`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  evaluatorMethod(kind: BoundKind) {
    const message = `Evaluator: Method for '${kind}' is not implemented`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  functionAlreadyDefined(functionName: string) {
    const message = `Function '${functionName}' has already been declared`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  globalFunctionDeclarationsOnly(functionName: string) {
    const message = `Function '${functionName}' can only be defined within the global scope`;
    return this.add(new Diagnostic(DiagnosticSeverity.Error, message));
  }
}
