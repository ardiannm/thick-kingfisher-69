import { DiagnosticKind } from "./DiagnosticKind";
import { Diagnostic } from "./Diagnostic";
import { SyntaxKind } from "../Syntax/SyntaxKind";
import { BoundKind } from "../Binding/BoundKind";
import { DiagnosticCode } from "./DiagnosticCode";
import { BoundDeclarationKind } from "../Binding/BoundDeclarationKind";

export class DiagnosticBag {
  private Diagnostics = new Array<Diagnostic>();

  Any() {
    return this.Diagnostics.length > 0;
  }

  Clear() {
    this.Diagnostics = new Array<Diagnostic>();
  }

  private ReportError(Diagnostic: Diagnostic) {
    this.Diagnostics.push(Diagnostic);
    return Diagnostic;
  }

  public BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Lexer, DiagnosticCode.BadTokenFound, Message));
  }

  public TokenNotAMatch(Matched: SyntaxKind) {
    const Message = `Unexpected token found <${Matched}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Parser, DiagnosticCode.TokenNotAMatch, Message));
  }

  public EmptyProgram() {
    const Message = `Syntax program cannot be empty.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, DiagnosticCode.EmptyProgram, Message));
  }

  public MissingEvaluationMethod(Kind: BoundKind) {
    const Message = `Method for evaluating <${Kind}> is missing.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, DiagnosticCode.MissingEvaluationMethod, Message));
  }

  public CantDivideByZero() {
    const Message = `Can't divide by zero.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, DiagnosticCode.CantDivideByZero, Message));
  }

  public MissingOperatorKind(Kind: SyntaxKind) {
    const Message = `Unexpected operator kind <${Kind}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.MissingOperatorKind, Message));
  }

  public CircularDependency(ForRef: string, InRef: string) {
    const Message = `Circular dependency detected for '${ForRef}' in '${InRef}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.CircularDependency, Message));
  }

  public MissingBindingMethod(Kind: SyntaxKind) {
    const Message = `Method for binding <${Kind}> is missing.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.MissingBindingMethod, Message));
  }

  public CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `<${Unexpected}> can't be used as a reference.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.CantUseAsAReference, Message));
  }

  public CantFindReference(Reference: string) {
    const Message = `Can't find reference '${Reference}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.CantFindReference, Message));
  }

  public UsedBeforeItsDeclaration(Reference: string) {
    const Message = `Using '${Reference}' before its declaration.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.UsedBeforeItsDeclaration, Message));
  }

  public WrongFloatingNumberFormat() {
    const Message = `Wrong floating number format.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Lexer, DiagnosticCode.WrongFloatingNumberFormat, Message));
  }

  public CantCopyNode(Left: SyntaxKind, Right: SyntaxKind) {
    const Message = `Can't copy <${Left}> to <${Right}>`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.CantCopyNode, Message));
  }

  public MissingDeclarationStatement(Kind: BoundDeclarationKind) {
    const Message = `Method for binding <${Kind}> is missing.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, DiagnosticCode.CantCopyNode, Message));
  }
}
