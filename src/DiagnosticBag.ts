import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { SyntaxKind } from "./CodeAnalysis/Parser/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticPhase } from "./DiagnosticPhase";
import { DiagnosticKind } from "./DiagnosticKind";

export class DiagnosticBag {
  private Bag = new Array<Diagnostic>();

  constructor(private Phase: DiagnosticPhase, Inherits?: DiagnosticBag) {
    if (Inherits) {
      for (const Diagnostic of Inherits.Show) this.Bag.push(Diagnostic);
    }
  }

  private ReportError(Diagnostic: Diagnostic) {
    this.Bag.push(Diagnostic);
    return Diagnostic;
  }

  get Show() {
    return this.Bag;
  }

  Add(Report: Diagnostic) {
    this.Bag.push(Report);
  }

  get Count() {
    return this.Bag.length;
  }

  Any() {
    return this.Count > 0;
  }

  Clear() {
    this.Bag.length = 0;
  }

  ReportBadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.BadTokenFound, Message));
  }

  ReportTokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `unexpected '${Matched}' found when expecting '${ExpectedKind}'.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.TokenNotAMatch, Message));
  }

  ReportEmptyProgram() {
    const Message = `Program contains no code.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.EmptyProgram, Message));
  }

  ReportMissingMethod(Kind: SyntaxKind | BoundKind) {
    const Message = `Method for '${Kind}' is not implemented.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.MissingMethod, Message));
  }

  ReportSwitchOperatorMethod(Kind: SyntaxKind) {
    const Message = `Method for switching operators for '${Kind}' is not implemented.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.SwitchOperatorMethod, Message));
  }

  ReportCantDivideByZero() {
    const Message = `Can't divide by zero.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.CantDivideByZero, Message));
  }

  ReportMissingOperatorKind(Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `Unexpected operator kind '${Kind}'.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.MissingOperatorKind, Message));
  }

  ReportCircularDependency(Name: string) {
    const Message = `Circular dependency found in '${Name}'.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.CircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: string) {
    const Message = `'${Unexpected}' can't be used as a reference.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.CantUseAsAReference, Message));
  }

  ReportCantCopy(Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Can't copy '${Kind}' to '${ExpectedKind}'.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.CantCopy, Message));
  }

  ReportUndefinedCell(Name: string) {
    const Message = `Cell reference '${Name}' is undefined.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.ReportUndefinedCell, Message));
  }

  ReportUsedBeforeItsDeclaration(Name: string) {
    const Message = `Using '${Name}' before its declaration.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.UsedBeforeItsDeclaration, Message));
  }

  ReportBadFloatingPointNumber() {
    const Message = `Wrong floating number format.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.BadFloatingPointNumber, Message));
  }

  ReportNotARangeMember(Kind: SyntaxKind) {
    const Message = `'${Kind}' is not a range member and it can't be bound.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.NotARangeMember, Message));
  }

  ReportGloballyNotAllowed(Kind: SyntaxKind) {
    const Message = `'${Kind}' can't be written directly outside in the global scope.`;
    return this.ReportError(new Diagnostic(this.Phase, DiagnosticKind.GloballyNotAllowed, Message));
  }
}
