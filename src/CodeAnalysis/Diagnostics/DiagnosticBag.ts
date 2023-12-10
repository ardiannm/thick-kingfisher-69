import { DiagnosticKind } from "./DiagnosticKind";
import { Diagnostic } from "./Diagnostic";
import { SyntaxToken } from "../Syntax/SyntaxToken";
import { SyntaxKind } from "../Syntax/SyntaxKind";
import { BoundKind } from "../Binding/BoundKind";

export class DiagnosticBag {
  private Stack = new Array<Diagnostic>();

  Any() {
    return this.Stack.length > 0;
  }

  Clear() {
    this.Stack = new Array<Diagnostic>();
  }

  private ReportError(Diagnose: Diagnostic) {
    this.Stack.push(Diagnose);
    return Diagnose;
  }

  BadTokenFound(Text: string) {
    const Message = `Bad character '${Text}' found.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Lexer, Message));
  }

  TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind) {
    const Message = `Expected <${Expected}>; found <${Matched}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Parser, Message));
  }

  EmptySyntaxForEvaluator() {
    const Message = `Syntax program cannot be empty.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, Message));
  }

  MissingEvaluationMethod(Kind: BoundKind) {
    const Message = `Method for evaluating <${Kind}> is missing.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, Message));
  }

  CantDivideByZero() {
    const Message = `Can't divide by zero.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, Message));
  }

  MissingOperatorKind(Kind: SyntaxKind) {
    const Message = `Unexpected operator kind <${Kind}>.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  CircularDependency(ForRef: string, InRef: string) {
    const Message = `Circular dependency detected for '${ForRef}' in '${InRef}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  MissingBindingMethod(Kind: SyntaxKind) {
    const Message = `Method for binding <${Kind}> is missing.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    const Message = `<${Unexpected}> can't be used as a reference.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  CantFindReference(Reference: string) {
    const Message = `Cannot find reference '${Reference}'.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  UsedBeforeItsDeclaration(Reference: string) {
    const Message = `Using '${Reference}' before its declaration.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, Message));
  }

  WrongFloatingNumberFormat() {
    const Message = `Wrong floating number format.`;
    return this.ReportError(new Diagnostic(DiagnosticKind.Lexer, Message));
  }
}
