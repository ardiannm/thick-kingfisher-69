import { SyntaxKind } from "../CodeAnalysis/Parser/Kind/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticKind } from "./DiagnosticKind";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  private ReportError(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
    return Diagnostic;
  }

  get Bag() {
    return this.Diagnostics;
  }

  get Count() {
    return this.Diagnostics.length;
  }

  Add(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
  }

  Clear() {
    this.Diagnostics.length = 0;
  }

  Any() {
    return this.Count > 0;
  }

  None() {
    return !this.Any();
  }

  BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadTokenFound, Message));
  }

  TokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found; expecting '${ExpectedKind}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.TokenNotAMatch, Message));
  }

  EmptyProgram() {
    const Message = `Program contains no code`;
    return this.ReportError(new Diagnostic(DiagnosticKind.EmptyProgram, Message));
  }

  CantDivideByZero() {
    const Message = `Can't divide by zero`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantDivideByZero, Message));
  }

  CircularDependency(ForName: string, InName: string) {
    const Message = `'${InName}' is circularly dependent to '${ForName}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `'${Unexpected}' is not assignable to a cell reference`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantUseAsAReference, Message));
  }

  UndeclaredCell(CellName: string) {
    const Message = `Cell reference '${CellName}' is undeclared`;
    return this.ReportError(new Diagnostic(DiagnosticKind.UndeclaredCell, Message));
  }

  BadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadFloatingPointNumber, Message));
  }

  InvalidCellState(SubjectName: string) {
    const Message = `Subject '${SubjectName}' is in an invalid state`;
    return this.ReportError(new Diagnostic(DiagnosticKind.InvalidCellState, Message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const Message = `Binder: Method for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BinderMethod, Message));
  }

  EvaluatorMethod(Kind: SyntaxKind) {
    const Message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(DiagnosticKind.EvaluatorMethod, Message));
  }
}
