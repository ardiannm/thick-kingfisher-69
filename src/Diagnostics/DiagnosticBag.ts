import { BoundBinaryOperatorKind } from "../CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundKind } from "../CodeAnalysis/Binder/BoundKind";
import { BoundUnaryOperatorKind } from "../CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { SyntaxKind } from "../CodeAnalysis/Parser/SyntaxKind";
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

  Merge(Diagnostics: DiagnosticBag) {
    for (const Diagnostic of Diagnostics.Bag) {
      this.ReportError(Diagnostic);
    }
    return this.Diagnostics;
  }

  Any() {
    return this.Count > 0;
  }

  ClearDiagnostics() {
    this.Diagnostics = new Array<Diagnostic>();
  }

  ReportBadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadTokenFound, Message));
  }

  ReportTokenMissmatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found when expecting '${ExpectedKind}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.TokenNotAMatch, Message));
  }

  ReportEmptyProgram() {
    const Message = `Program contains no code`;
    return this.ReportError(new Diagnostic(DiagnosticKind.EmptyProgram, Message));
  }

  ReportMissingMethod(Kind: SyntaxKind | BoundKind) {
    const Message = `Method for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(DiagnosticKind.MissingMethod, Message));
  }

  ReportSwitchOperatorMethod(Kind: SyntaxKind) {
    const Message = `Method for switching operators for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(DiagnosticKind.SwitchOperatorMethod, Message));
  }

  ReportCantDivideByZero() {
    const Message = `Can't divide by zero`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantDivideByZero, Message));
  }

  ReportMissingOperatorKind(Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `Unexpected operator kind '${Kind}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.MissingOperatorKind, Message));
  }

  ReportCircularDependency(ForName: string, InName: string) {
    const Message = `Circular dependency '${ForName}' in '${InName}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: string) {
    const Message = `'${Unexpected}' can't be used as a reference`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantUseAsAReference, Message));
  }

  ReportCantCopy(Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Can't copy '${Kind}' to '${ExpectedKind}'`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantCopy, Message));
  }

  ReportUndefinedCell(Name: string) {
    const Message = `Cell reference '${Name}' is undefined`;
    return this.ReportError(new Diagnostic(DiagnosticKind.ReportUndefinedCell, Message));
  }

  ReportBadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadFloatingPointNumber, Message));
  }

  ReportNotARangeMember(Kind: SyntaxKind) {
    const Message = `'${Kind}' is not a range member and it can't be bound`;
    return this.ReportError(new Diagnostic(DiagnosticKind.NotARangeMember, Message));
  }

  ReportGloballyNotAllowed(Kind: SyntaxKind) {
    const Message = `'${Kind}' can't be written directly outside in the global scope`;
    return this.ReportError(new Diagnostic(DiagnosticKind.GloballyNotAllowed, Message));
  }
}
