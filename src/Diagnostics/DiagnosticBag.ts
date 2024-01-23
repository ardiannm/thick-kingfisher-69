import { Cell } from "../Cell";
import { SyntaxKind } from "../CodeAnalysis/Parser/Kind/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticSeverity } from "./DiagnosticSeverity";

export class DiagnosticBag {
  private Errors = new Array<Diagnostic>();
  private Informations = new Array<Diagnostic>();
  private Warnings = new Array<Diagnostic>();
  private Feedbacks = new Array<Diagnostic>();

  private AddToSeverityList(Diagnostic: Diagnostic) {
    switch (Diagnostic.Severity) {
      case DiagnosticSeverity.Error:
        this.Errors.push(Diagnostic);
        break;
      case DiagnosticSeverity.Informative:
        this.Informations.push(Diagnostic);
        break;
      case DiagnosticSeverity.Warning:
        this.Warnings.push(Diagnostic);
        break;
      case DiagnosticSeverity.Feedback:
        this.Feedbacks.push(Diagnostic);
        break;
    }
    return Diagnostic;
  }

  *Bag() {
    for (const d of this.Errors) yield d;
    for (const d of this.Informations) yield d;
    for (const d of this.Warnings) yield d;
    for (const d of this.Feedbacks) yield d;
  }

  Add(Diagnostic: Diagnostic) {
    this.AddToSeverityList(Diagnostic);
  }

  Clear() {
    this.Errors.length = 0;
    this.Warnings.length = 0;
    this.Informations.length = 0;
    this.Warnings.length = 0;
    this.Feedbacks.length = 0;
  }

  Any() {
    return this.Errors.length + this.Feedbacks.length > 0;
  }

  None() {
    return !this.Any();
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
    const Message = `Reference '${Subject}' is in an invalid state`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Error, Message));
  }

  AutoDeclaredCell(Subject: Cell, Cell: Cell) {
    const Message = `Reference '${Subject.Name}' has been declared automatically after being referenced by '${Cell.Name}'`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Informative, Message));
  }

  BinderMethod(Kind: SyntaxKind) {
    const Message = `Binder: Method for '${Kind}' is not implemented`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Feedback, Message));
  }

  EvaluatorMethod(Kind: SyntaxKind) {
    const Message = `Evaluator: Method for '${Kind}' is not implemented`;
    return this.AddToSeverityList(new Diagnostic(DiagnosticSeverity.Feedback, Message));
  }
}
