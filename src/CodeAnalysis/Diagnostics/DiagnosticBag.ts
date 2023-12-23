import { DiagnosticKind } from "./DiagnosticKind";
import { Diagnostic } from "./Diagnostic";
import { SyntaxKind } from "../Parser/SyntaxKind";
import { BoundKind } from "../Binder/BoundKind";
import { DiagnosticCode } from "./DiagnosticCode";
import { BoundBinaryOperatorKind } from "../Binder/BoundBinaryOperatorKind";
import { BoundUnaryOperatorKind } from "../Binder/BoundUnaryOperatorKind";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  constructor(public Kind: DiagnosticKind) {}

  private ReportError(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
    return Diagnostic;
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
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportBadTokenFound, Message));
  }

  ReportTokenNotAMatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `expecting <${ExpectedKind}>, matched <${Matched}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportTokenNotAMatch, Message));
  }

  ReportEmptyProgram() {
    const Message = `program contains no code.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportEmptyProgram, Message));
  }

  ReportMissingMethod(Kind: SyntaxKind | BoundKind) {
    const Message = `method for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportMissingMethod, Message));
  }

  ReportSwitchOperatorMethod(Kind: SyntaxKind) {
    const Message = `method for switching operators for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportSwitchOperatorMethod, Message));
  }

  ReportCantDivideByZero() {
    const Message = `can't divide by zero.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportCantDivideByZero, Message));
  }

  ReportMissingOperatorKind(Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `unexpected operator kind <${Kind}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportMissingOperatorKind, Message));
  }

  ReportCircularDependency(Name: string) {
    const Message = `circular dependency found in '${Name}'.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportCircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: string) {
    const Message = `<${Unexpected}> can't be used as a reference.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CantUseAsAReference, Message));
  }

  ReportCantCopy(Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `can't copy <${Kind}> to <${ExpectedKind}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportCantCopy, Message));
  }

  ReportNameNotFound(Name: string) {
    const Message = `can't find name '${Name}'.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportNameNotFound, Message));
  }

  ReportUsedBeforeItsDeclaration(Name: string) {
    const Message = `using '${Name}' before its declaration.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportUsedBeforeItsDeclaration, Message));
  }

  ReportBadFloatingPointNumber() {
    const Message = `wrong floating number format.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportBadFloatingPointNumber, Message));
  }

  ReportNotARangeMember(Kind: SyntaxKind) {
    const Message = `<${Kind}> is not a range member and it can't be bound.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportNotARangeMember, Message));
  }

  ReportGloballyNotAllowed(Kind: SyntaxKind) {
    const Message = `<${Kind}> can't be written directly outside in the global scope.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.ReportGloballyNotAllowed, Message));
  }
}
