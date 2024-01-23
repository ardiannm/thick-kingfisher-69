import { Cell } from "../Cell";
import { BoundKind } from "../CodeAnalysis/Binder/Kind/BoundKind";
import { SyntaxKind } from "../CodeAnalysis/Parser/Kind/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticSeverity } from "./DiagnosticSeverity";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  private AddToSeverityList(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
  }

  Bag() {
    return this.Diagnostics;
  }

  Add(Diagnostic: Diagnostic) {
    this.AddToSeverityList(Diagnostic);
  }

  Clear() {
    this.Diagnostics.length = 0;
  }

  Any() {
    return this.Filter(DiagnosticSeverity.Error, DiagnosticSeverity.Dev).length > 0;
  }

  None() {
    return !this.Any();
  }

  Filter(...Severity: Array<DiagnosticSeverity>) {
    return this.Diagnostics.filter((d) => Severity.includes(d.Severity));
  }

  BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  TokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found; expecting '${ExpectedKind}'`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  EmptyProgram() {
    const Message = `Program contains no code`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantDivideByZero() {
    const Message = `Can't divide by zero`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CircularDependency(ForName: string, InName: string) {
    const Message = `'${InName}' is circularly dependent to '${ForName}'`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `'${Unexpected}' is not assignable to a cell reference`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  UndeclaredCell(CellName: string) {
    const Message = `Cell reference '${CellName}' is undeclared`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  BadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  InvalidCellState(Subject: Cell) {
    const Message = `Reference '${Subject.Name}' is in an invalid state`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  AutoDeclaredCell(Subject: Cell, Cell: Cell) {
    const Message = `Reference '${Subject.Name}' has been declared automatically after being referenced by '${Cell.Name}'`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Informative, Message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const Message = `Binder: Method for '${Kind}' is not implemented`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }

  EvaluatorMethod(Kind: BoundKind) {
    const Message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Dev, Message));
  }
}
