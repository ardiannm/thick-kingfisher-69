import { Cell } from "../../cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";

export class DiagnosticBag {
  private diagnostics = new Array<Diagnostic>();

  none() {
    return !(this.diagnostics.length > 0);
  }

  merge(bag: DiagnosticBag) {
    for (const d of bag.diagnostics) this.report(d);
  }

  private report(d: Diagnostic) {
    this.diagnostics.push(d);
  }

  badTokenFound(text: string) {
    return this.report(new Diagnostic(`Bad character '${text}' found`));
  }

  tokenMissmatch(matched: SyntaxKind, expectedKind: SyntaxKind) {
    return this.report(new Diagnostic(`Unexpected '${matched}' found, expecting '${expectedKind}'`));
  }

  emptyProgram() {
    return this.report(new Diagnostic(`Program contains no code`));
  }

  cantDivideByZero() {
    return this.report(new Diagnostic(`Can't divide by zero`));
  }

  circularDependency(observer: Cell) {
    return this.report(new Diagnostic(`Circular dependency detected in '${observer.name}'`));
  }

  cantUseAsAReference(unexpected: SyntaxKind) {
    return this.report(new Diagnostic(`'${unexpected}' is not assignable to a cell reference`));
  }

  undeclaredCell(cellName: string) {
    return this.report(new Diagnostic(`Cell reference '${cellName}' is undeclared`));
  }

  badFloatingPointNumber() {
    return this.report(new Diagnostic(`Wrong floating number format`));
  }

  invalidCellState(subject: Cell) {
    return this.report(new Diagnostic(`Reference '${subject.name}' is in an invalid state`));
  }

  autoDeclaredCell(subject: Cell, cell: Cell) {
    return this.report(new Diagnostic(`Reference '${subject.name}' has been declared automatically after being referenced by '${cell.name}'`));
  }

  wrongCellNameFormat(didYouMean: string) {
    return this.report(new Diagnostic(`Did you mean '${didYouMean}'?`));
  }

  binderMethod(kind: SyntaxKind) {
    return this.report(new Diagnostic(`Binder: Method for '${kind}' is not implemented`));
  }

  evaluatorMethod(kind: BoundKind) {
    return this.report(new Diagnostic(`Evaluator: Method for '${kind}' is not implemented`));
  }

  functionAlreadyDefined(functionName: string) {
    return this.report(new Diagnostic(`Function '${functionName}' has already been declared`));
  }

  globalFunctionDeclarationsOnly(functionName: string) {
    return this.report(new Diagnostic(`Function '${functionName}' can only be defined within the global scope`));
  }
}
