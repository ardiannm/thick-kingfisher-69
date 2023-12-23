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
    return this.Diagnostics.length > 0;
  }

  Clear() {
    this.Diagnostics = new Array<Diagnostic>();
  }

  BadTokenFound(Text: string) {
    const Message = `bad character '${Text}' found.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.BadTokenFound, Message));
  }

  TokenNotAMatch(Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `expecting <${ExpectedKind}>, matched <${Matched}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.TokenNotAMatch, Message));
  }

  SourceCodeIsEmpty() {
    const Message = `source code is empty.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.SourceCodeIsEmpty, Message));
  }

  MissingMethod(Kind: SyntaxKind | BoundKind) {
    const Message = `method for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.MissingMethod, Message));
  }

  MissingSwitchSignMethod(Kind: SyntaxKind) {
    const Message = `method for switching operators for <${Kind}> is not implemented.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.MissingSwitchSignMethod, Message));
  }

  CantDivideByZero() {
    const Message = `can't divide by zero.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CantDivideByZero, Message));
  }

  MissingOperatorKind(Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `unexpected operator kind <${Kind}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.MissingOperatorKind, Message));
  }

  CircularDependency(Name: string) {
    const Message = `circular dependency found in '${Name}'.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CircularDependency, Message));
  }

  CantUseAsAReference(Unexpected: string) {
    const Message = `<${Unexpected}> can't be used as a reference.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CantUseAsAReference, Message));
  }

  CantUseForCopy(Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `can't copy <${Kind}> to <${ExpectedKind}>.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CantUseForCopy, Message));
  }

  NameNotFound(Name: string) {
    const Message = `can't find name '${Name}'.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.NameNotFound, Message));
  }

  UsedBeforeItsDeclaration(Name: string) {
    const Message = `using '${Name}' before its declaration.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.UsedBeforeItsDeclaration, Message));
  }

  WrongFloatingNumberFormat() {
    const Message = `wrong floating number format.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.WrongFloatingNumberFormat, Message));
  }

  NotARangeBranch(Kind: SyntaxKind) {
    const Message = `<${Kind}> is not a range member and it can't be bound.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.NotARangeMember, Message));
  }

  CantWriteExpression(Kind: SyntaxKind) {
    const Message = `<${Kind}> can't be written directly outside in the global scope.`;
    return this.ReportError(new Diagnostic(this.Kind, DiagnosticCode.CantWriteExpression, Message));
  }
}
