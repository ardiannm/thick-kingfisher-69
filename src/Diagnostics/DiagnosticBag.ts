import { Cell } from "../Cell";
import { BoundKind } from "../CodeAnalysis/Binding/Kind/BoundKind";
import { SyntaxKind } from "../CodeAnalysis/Parsing/Kind/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticSeverity } from "./DiagnosticSeverity";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  Get() {
    return this.Diagnostics;
  }

  Any() {
    return this.Get().length > 0;
  }

  None() {
    return !this.Any();
  }

  Add(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
  }

  Clear() {
    this.Diagnostics.length = 0;
  }

  BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  TokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found; expecting '${ExpectedKind}'`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  EmptyProgram() {
    const Message = `Program contains no code`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantDivideByZero() {
    const Message = `Can't divide by zero`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CircularDependency(ForName: string, InName: string) {
    const Message = `'${InName}' is circularly dependent to '${ForName}'`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `'${Unexpected}' is not assignable to a cell reference`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  UndeclaredCell(CellName: string) {
    const Message = `Cell reference '${CellName}' is undeclared`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  BadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  InvalidCellState(Subject: Cell) {
    const Message = `Reference '${Subject.Name}' is in an invalid state`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  AutoDeclaredCell(Subject: Cell, Cell: Cell) {
    const Message = `Reference '${Subject.Name}' has been declared automatically after being referenced by '${Cell.Name}'`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Informative, Message));
  }

  WrongCellNameFormat(DidYouMean: string) {
    const Message = `Did you mean '${DidYouMean}'?`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const Message = `Binder: Method for '${Kind}' is not implemented`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }

  EvaluatorMethod(Kind: BoundKind) {
    const Message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.Diagnostics.push(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }
}
