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

  CantUseAsAReference(Unexpected: string) {
    const Message = `'${Unexpected}' can't be used as a reference`;
    return this.ReportError(new Diagnostic(DiagnosticKind.CantUseAsAReference, Message));
  }

  NameNotFound(Name: string) {
    const Message = `Cell reference '${Name}' is undeclared`;
    return this.ReportError(new Diagnostic(DiagnosticKind.NameNotFound, Message));
  }

  BadFloatingPointNumber() {
    const Message = `Wrong floating number format`;
    return this.ReportError(new Diagnostic(DiagnosticKind.BadFloatingPointNumber, Message));
  }
}
