import { Cell } from "../../runtime/cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { Severity } from "./severity";

export class DiagnosticsBag {
  private diagnostics = new Array<Diagnostic>();
  private severity = new Set<Severity>();

  private report(message: string, severity: Severity) {
    this.severity.add(severity);
    this.diagnostics.push(Diagnostic.createFrom(message, severity));
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

  badCharacterFound(text: string) {
    return this.report(`Bad character '${text}' found.`, Severity.Ok);
  }

  badTokenFound(matched: SyntaxKind) {
    return this.report(`Unexpected token found: '${matched}'.`, Severity.CantBind);
  }

  emptyProgram() {
    return this.report(`Program contains no code.`, Severity.CantBind);
  }

  cantDivideByZero() {
    return this.report(`Can't divide by zero.`, Severity.Ok);
  }

  circularDependency(reference: string, dependency: string) {
    return this.report(`Circular dependency '${dependency}' detected while binding '${reference}'.`, Severity.CantEvaluate);
  }

  cantUseAsAReference(unexpected: SyntaxKind) {
    return this.report(`'${unexpected}' is not assignable to a cell reference.`, Severity.CantEvaluate);
  }

  undeclaredCell(cellName: string) {
    return this.report(`Cell reference '${cellName}' is undeclared.`, Severity.CantEvaluate);
  }

  badFloatingPointNumber() {
    return this.report(`Wrong floating number format.`, Severity.CantBind);
  }

  autoDeclaredCell(reference: Cell, dependency: Cell) {
    return this.report(`Reference '${reference.name}' has been declared automatically after being referenced by '${dependency.name}'.`, Severity.Ok);
  }

  badCellReference(correctName: string) {
    return this.report(`Not a valid cell reference. Did you mean '${correctName}'?`, Severity.CantBind);
  }

  binderMethod(kind: SyntaxKind) {
    return this.report(`Method for binding '${kind}' is not implemented.`, Severity.CantEvaluate);
  }

  evaluatorMethod(kind: BoundKind) {
    return this.report(`Method for evaluating '${kind}' is not implemented.`, Severity.Ok);
  }
}
