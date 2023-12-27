import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { SyntaxKind } from "./CodeAnalysis/Parser/SyntaxKind";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticPhase } from "./DiagnosticPhase";
import { DiagnosticKind } from "./DiagnosticKind";

export class DiagnosticBag {
  private Bag = new Array<Diagnostic>();

  constructor(Inherits?: DiagnosticBag) {
    if (Inherits) for (const Diagnostic of Inherits.Show) this.Bag.push(Diagnostic);
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

  ClearDiagnostics() {
    this.Bag = new Array<Diagnostic>();
  }

  ReportBadTokenFound(Phase: DiagnosticPhase, Text: string) {
    const Message = `Bad character '${Text}' found`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.BadTokenFound, Message));
  }

  ReportTokenMissmatch(Phase: DiagnosticPhase, Matched: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Unexpected '${Matched}' found when expecting '${ExpectedKind}'`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.TokenNotAMatch, Message));
  }

  ReportEmptyProgram(Phase: DiagnosticPhase) {
    const Message = `Program contains no code`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.EmptyProgram, Message));
  }

  ReportMissingMethod(Phase: DiagnosticPhase, Kind: SyntaxKind | BoundKind) {
    const Message = `Method for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.MissingMethod, Message));
  }

  ReportSwitchOperatorMethod(Phase: DiagnosticPhase, Kind: SyntaxKind) {
    const Message = `Method for switching operators for '${Kind}' is not implemented`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.SwitchOperatorMethod, Message));
  }

  ReportCantDivideByZero(Phase: DiagnosticPhase) {
    const Message = `Can't divide by zero`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.CantDivideByZero, Message));
  }

  ReportMissingOperatorKind(Phase: DiagnosticPhase, Kind: BoundBinaryOperatorKind | BoundUnaryOperatorKind | SyntaxKind) {
    const Message = `Unexpected operator kind '${Kind}'`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.MissingOperatorKind, Message));
  }

  ReportCircularDependency(Phase: DiagnosticPhase, ForName: string, InName: string) {
    const Message = `Circular dependency for '${ForName}' found in '${InName}'`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.CircularDependency, Message));
  }

  CantUseAsAReference(Phase: DiagnosticPhase, Unexpected: string) {
    const Message = `'${Unexpected}' can't be used as a reference`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.CantUseAsAReference, Message));
  }

  ReportCantCopy(Phase: DiagnosticPhase, Kind: SyntaxKind, ExpectedKind: SyntaxKind) {
    const Message = `Can't copy '${Kind}' to '${ExpectedKind}'`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.CantCopy, Message));
  }

  ReportUndefinedCell(Phase: DiagnosticPhase, Name: string) {
    const Message = `Cell reference '${Name}' is undefined`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.ReportUndefinedCell, Message));
  }

  ReportUsedBeforeItsDeclaration(Phase: DiagnosticPhase, Name: string) {
    const Message = `Using '${Name}' before its declaration`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.UsedBeforeItsDeclaration, Message));
  }

  ReportBadFloatingPointNumber(Phase: DiagnosticPhase) {
    const Message = `Wrong floating number format`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.BadFloatingPointNumber, Message));
  }

  ReportNotARangeMember(Phase: DiagnosticPhase, Kind: SyntaxKind) {
    const Message = `'${Kind}' is not a range member and it can't be bound`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.NotARangeMember, Message));
  }

  ReportGloballyNotAllowed(Phase: DiagnosticPhase, Kind: SyntaxKind) {
    const Message = `'${Kind}' can't be written directly outside in the global scope`;
    return this.ReportError(new Diagnostic(Phase, DiagnosticKind.GloballyNotAllowed, Message));
  }
}
