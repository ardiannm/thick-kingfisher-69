import { SyntaxKind } from "../SyntaxKind";
import { SyntaxToken } from "../SyntaxToken";
import { DiagnoseKind } from "./DiagnoseKind";
import { Diagnose } from "./Diagnose";
import { BoundKind } from "../Binding/BoundKind";

export class Diagnostics {
  private Stack = new Array<Diagnose>();

  Any() {
    return this.Stack.length > 0;
  }

  Clear() {
    this.Stack = new Array<Diagnose>();
  }

  private ReportError(Diagnose: Diagnose) {
    this.Stack.push(Diagnose);
    return Diagnose;
  }

  BadTokenFound(Token: SyntaxToken) {
    return this.ReportError(new Diagnose(DiagnoseKind.Lexer, `Bad Character '${Token.Text}' Found.`));
  }

  TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind) {
    return this.ReportError(new Diagnose(DiagnoseKind.Parser, `Expected <${Expected}>; Found <${Matched}>.`));
  }

  UndeclaredVariable(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Environment, `Reference '${Reference}' Has Not Been Declared.`));
  }

  MissingEvaluationMethod(Kind: BoundKind) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Evaluator, `Method For Evaluating <${Kind}> Is Missing.`));
  }

  NotAnOperator(Kind: SyntaxKind) {
    return this.ReportError(new Diagnose(DiagnoseKind.Binder, `Node <${Kind}> Is Not An Operator.`));
  }

  CircularDependency(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `Circular Dependency For '${Reference}' Detected.`));
  }

  MissingBindingMethod(Kind: SyntaxKind) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `Method For Binding <${Kind}> Is Missing.`));
  }

  CantUseAsAReference(Unexpected: SyntaxKind) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `<${Unexpected}> Can't Be Used As A Reference.`));
  }

  ReferenceCannotBeFound(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `Cannot Find Reference '${Reference}'.`));
  }

  CannotRedeclareReference(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `'${Reference}' Already Exists. Reference Re-Assignments Are Not Allowed.`));
  }

  EmptySyntaxForEvaluator() {
    throw this.ReportError(new Diagnose(DiagnoseKind.Evaluator, `Syntax Program Cannot Be Empty.`));
  }

  ValueDoesNotExist(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Environment, `Value For '${Reference}' Does Not Exist.`));
  }

  UsedBeforeDeclaration(Reference: string) {
    throw this.ReportError(new Diagnose(DiagnoseKind.Binder, `'${Reference}' Reference Used Before Its Declaration.`));
  }
}
