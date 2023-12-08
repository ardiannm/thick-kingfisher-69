import { DiagnosticKind } from "./DiagnosticKind";
import { Diagnostic } from "./Diagnostic";
import { SyntaxToken } from "../SyntaxToken";
import { SyntaxKind } from "../SyntaxKind";
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

  BadTokenFound(Token: SyntaxToken) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Lexer, `Bad Character '${Token.Text}' Found.`));
  }

  TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Parser, `Expected <${Expected}>; Found <${Matched}>.`));
  }

  UndeclaredVariable(Reference: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Environment, `Reference '${Reference}' Has Not Been Declared.`));
  }

  MissingEvaluationMethod(Kind: BoundKind) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, `Method For Evaluating <${Kind}> Is Missing.`));
  }

  MissingOperatorKind(Kind: SyntaxKind) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `Unexpected Operator Kind <${Kind}>.`));
  }

  CircularDependency(ForRef: string, InRef: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `Circular Dependency Detected For '${ForRef}' In '${InRef}'.`));
  }

  MissingBindingMethod(Kind: SyntaxKind) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `Method For Binding <${Kind}> Is Missing.`));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `<${Unexpected}> Can't Be Used As A Reference.`));
  }

  CantFindReference(Reference: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `Cannot Find Reference '${Reference}'.`));
  }

  CannotRedeclareReference(Reference: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `'${Reference}' Already Exists. Reference Re-Assignments Are Not Allowed.`));
  }

  EmptySyntaxForEvaluator() {
    return this.ReportError(new Diagnostic(DiagnosticKind.Evaluator, `Syntax Program Cannot Be Empty.`));
  }

  ValueDoesNotExist(Reference: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Environment, `Value For '${Reference}' Does Not Exist.`));
  }

  UsedBeforeItsDeclaration(Reference: string) {
    return this.ReportError(new Diagnostic(DiagnosticKind.Binder, `Using '${Reference}' Before Its Declaration.`));
  }
}
