import { Cell } from "../../cell";
import { BoundKind } from "../binder/kind/bound.kind";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Diagnostic } from "./diagnostic";
import { DiagnosticSeverity } from "./diagnostic.severity";

export class DiagnosticBag {
  private DiagnosticsOther = new Array<Diagnostic>();
  private DiagnosticsError = new Array<Diagnostic>();

  Get() {
    return [...this.DiagnosticsOther, ...this.DiagnosticsError];
  }

  Any() {
    return this.DiagnosticsError.length > 0;
  }

  None() {
    return !this.Any();
  }

  Add(Diagnostic: Diagnostic) {
    switch (Diagnostic.Severity) {
      case DiagnosticSeverity.Dev:
      case DiagnosticSeverity.Error:
        this.DiagnosticsError.push(Diagnostic);
        break;
      case DiagnosticSeverity.Warning:
      case DiagnosticSeverity.Informative:
        this.DiagnosticsOther.push(Diagnostic);
        break;
    }
  }

  Clear() {
    this.DiagnosticsOther.length = 0;
    this.DiagnosticsError.length = 0;
  }

  BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  TokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found; expecting '${ExpectedKind}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  EmptyProgram() {
    const Message = `Program contains no code`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantDivideByZero() {
    const Message = `Can't divide by zero`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CircularDependency(Observer: Cell) {
    const Message = `Circular dependency detected in '${Observer.Name}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `'${Unexpected}' is not assignable to a cell reference`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  UndeclaredCell(CellName: string) {
    const Message = `Cell reference '${CellName}' is undeclared`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  BadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  InvalidCellState(Subject: Cell) {
    const Message = `Reference '${Subject.Name}' is in an invalid state`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  AutoDeclaredCell(Subject: Cell, Cell: Cell) {
    const Message = `Reference '${Subject.Name}' has been declared automatically after being referenced by '${Cell.Name}'`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Informative, Message));
  }

  WrongCellNameFormat(DidYouMean: string) {
    const Message = `Did you mean '${DidYouMean}'?`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const Message = `Binder: Method for '${Kind}' is not implemented`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }

  EvaluatorMethod(Kind: BoundKind) {
    const Message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.Add(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }
}
