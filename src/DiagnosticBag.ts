import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { SyntaxKind } from "./CodeAnalysis/Parser/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticKind } from "./DiagnosticKind";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  private ReportError(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
    return Diagnostic;
  }

  get Reports() {
    return this.Diagnostics;
  }

  Add(Report: Diagnostic) {
    this.Diagnostics.push(Report);
  }

  get Count() {
    return this.Diagnostics.length;
  }

  Any() {
    return this.Count > 0;
  }

  Clear() {
    this.Diagnostics = new Array<Diagnostic>();
  }

  ReportBadTokenFound(Text: string) {
    const Message = `bad character '${Text}' found.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadTokenFound, Message));
  }

  ReportTokenNotAMatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `expecting <${ExpectedKind}>, matched <${Matched}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.TokenNotAMatch, Message));
  }

  ReportEmptyProgram() {
    const Message = `program contains no code.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.EmptyProgram, Message));
  }

  ReportMissingMethod(Kind: SyntaxKind | BoundKind) {
    const Message = `method for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.MissingMethod, Message));
  }

  ReportSwitchOperatorMethod(Kind: SyntaxKind) {
    const Message = `method for switching operators for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.SwitchOperatorMethod, Message));
  }

  ReportCantDivideByZero() {
    const Message = `can't divide by zero.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantDivideByZero, Message));
  }

  ReportMissingOperatorKind(Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `unexpected operator kind <${Kind}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.MissingOperatorKind, Message));
  }

  ReportCircularDependency(Name: string) {
    const Message = `circular dependency found in '${Name}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: string) {
    const Message = `<${Unexpected}> can't be used as a reference.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantUseAsAReference, Message));
  }

  ReportCantCopy(Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `can't copy <${Kind}> to <${ExpectedKind}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantCopy, Message));
  }

  ReportNameNotFound(Name: string) {
    const Message = `can't find name '${Name}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.NameNotFound, Message));
  }

  ReportUsedBeforeItsDeclaration(Name: string) {
    const Message = `using '${Name}' before its declaration.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.UsedBeforeItsDeclaration, Message));
  }

  ReportBadFloatingPointNumber() {
    const Message = `wrong floating number format.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadFloatingPointNumber, Message));
  }

  ReportNotARangeMember(Kind: SyntaxKind) {
    const Message = `<${Kind}> is not a range member and it can't be bound.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.NotARangeMember, Message));
  }

  ReportGloballyNotAllowed(Kind: SyntaxKind) {
    const Message = `<${Kind}> can't be written directly outside in the global scope.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.GloballyNotAllowed, Message));
  }
}
