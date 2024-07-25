import { Cell } from "../../cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";

export class DiagnosticBag {
  private diagnostics = new Array<Diagnostic>();

  private report(message: string) {
    this.diagnostics.push(Diagnostic.createFrom(message));
  }

  isEmpty() {
    return !(this.diagnostics.length > 0);
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  badCharacterFound(text: string) {
    return this.report(`Lexer: Bad character '${text}' found.`);
  }

  unexpectedTokenFound(matched: SyntaxKind) {
    return this.report(`Parser: Unexpected token found: '${matched}'.`);
  }

  emptyProgram() {
    return this.report(`Program contains no code.`);
  }

  cantDivideByZero() {
    return this.report(`Can't divide by zero.`);
  }

  circularDependency(observer: Cell) {
    return this.report(`Circular dependency detected in '${observer.name}'.`);
  }

  cantUseAsAReference(unexpected: SyntaxKind) {
    return this.report(`'${unexpected}' is not assignable to a cell reference.`);
  }

  undeclaredCell(cellName: string) {
    return this.report(`Cell reference '${cellName}' is undeclared.`);
  }

  badFloatingPointNumber() {
    return this.report(`Wrong floating number format.`);
  }

  invalidCellState(subject: Cell) {
    return this.report(`Reference '${subject.name}' is in an invalid state.`);
  }

  autoDeclaredCell(subject: Cell, cell: Cell) {
    return this.report(`Reference '${subject.name}' has been declared automatically after being referenced by '${cell.name}'.`);
  }

  wrongCellNameFormat(didYouMean: string) {
    return this.report(`Did you mean '${didYouMean}'?`);
  }

  binderMethod(kind: SyntaxKind) {
    return this.report(`Binder: Method for '${kind}' is not implemented.`);
  }

  evaluatorMethod(kind: BoundKind) {
    return this.report(`Evaluator: Method for '${kind}' is not implemented.`);
  }

  functionAlreadyDefined(functionName: string) {
    return this.report(`Function '${functionName}' has already been declared.`);
  }

  globalFunctionDeclarationsOnly(functionName: string) {
    return this.report(`Function '${functionName}' can only be defined within the global scope.`);
  }
}
