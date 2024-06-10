import { Cell } from "../../cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { DiagnosticSeverity } from "./diagnostic.severity";

export class DiagnosticBag {
  private other = new Array<Diagnostic>();
  private error = new Array<Diagnostic>();

  get none() {
    return !(this.error.length > 0);
  }

  Get() {
    return [...this.other, ...this.error];
  }

  Add(diagnostic: Diagnostic) {
    switch (diagnostic.Severity) {
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

  Clear() {
    this.other.length = 0;
    this.error.length = 0;
  }

  BadTokenFound(text: string) {
    const message = `Bad character '${text}' found`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  TokenMissmatch(matched: SyntaxKind, expectedKind: SyntaxKind) {
    const message = `unexpected '${matched}' found, expecting '${expectedKind}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  EmptyProgram() {
    const message = `Program contains no code`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  CantDivideByZero() {
    const message = `Can't divide by zero`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  CircularDependency(observer: Cell) {
    const message = `Circular dependency detected in '${observer.name}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  CantUseAsAReference(unexpected: SyntaxKind) {
    const message = `'${unexpected}' is not assignable to a cell reference`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  UndeclaredCell(CellName: string) {
    const message = `Cell reference '${CellName}' is undeclared`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  BadFloatingPointNumber() {
    const message = `Wrong floating number format`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  InvalidCellState(subject: Cell) {
    const message = `Reference '${subject.name}' is in an invalid state`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  AutoDeclaredCell(subject: Cell, Cell: Cell) {
    const message = `Reference '${subject.name}' has been declared automatically after being referenced by '${Cell.name}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Informative, message));
  }

  WrongCellNameFormat(DidYouMean: string) {
    const message = `Did you mean '${DidYouMean}'?`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const message = `Binder: Method for '${Kind}' is not implemented`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  EvaluatorMethod(Kind: BoundKind) {
    const message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  FunctionAlreadyDefined(FunctionName: string) {
    const message = `Function '${FunctionName}' has already been declared`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }

  GlobalFunctionDeclarationsOnly(FunctionName: string) {
    const message = `Function '${FunctionName}' can only be defined within the global scope`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, message));
  }
}
