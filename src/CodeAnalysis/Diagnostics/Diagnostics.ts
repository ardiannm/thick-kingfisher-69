import { SyntaxKind } from "../SyntaxKind";
import { SyntaxToken } from "../SyntaxToken";
import { ErrorKind } from "./ErrorKind";
import { Diagnostic } from "./Diagnostic";
import { BoundKind } from "../Binding/BoundKind";

export class Diagnostics {
  private Bag = new Array<Diagnostic>();

  Any() {
    return this.Bag.length > 0;
  }

  Show() {
    console.log();
    for (const d of this.Bag) console.log(d.Message);
    console.log();
  }

  Clear() {
    this.Bag = new Array<Diagnostic>();
  }

  Log(Tree: Object = "") {
    console.log("\n" + `${typeof Tree === "string" ? Tree : JSON.stringify(Tree, undefined, 2)}` + "\n");
  }

  private ReportError(Err: Diagnostic) {
    this.Bag.push(Err);
    return Err;
  }

  BadTokenFound(Token: SyntaxToken) {
    return this.ReportError(new Diagnostic(ErrorKind.Lexer, `Bad Character '${Token.Text}' Found.`));
  }

  TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind) {
    return this.ReportError(new Diagnostic(ErrorKind.Parser, `Expected <${Expected}>; Found <${Matched}>.`));
  }

  UndeclaredVariable(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.Environment, `Reference '${Reference}' Has Not Been Declared.`));
  }

  MissingEvaluationMethod(Kind: BoundKind) {
    throw this.ReportError(new Diagnostic(ErrorKind.Evaluator, `Method For Evaluating <${Kind}> Is Missing.`));
  }

  NotAnOperator(Kind: SyntaxKind) {
    return this.ReportError(new Diagnostic(ErrorKind.Binder, `Node <${Kind}> Is Not An Operator.`));
  }

  CircularDependency(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.Binder, `Circular Dependency For '${Reference}' Detected.`));
  }

  MissingBindingMethod(Kind: SyntaxKind) {
    throw this.ReportError(new Diagnostic(ErrorKind.Binder, `Method For Binding <${Kind}> Is Missing.`));
  }

  CannotReferenceNode(Unexpected: SyntaxKind, Kind: SyntaxKind) {
    throw this.ReportError(new Diagnostic(ErrorKind.Binder, `Unexpected Syntax Kind <${Unexpected}> In <${Kind}>.`));
  }

  ReferenceCannotBeFound(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.Binder, `Cannot Find Reference '${Reference}'.`));
  }

  CannotRedeclareReference(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.Binder, `'${Reference}' Already Exists. Reference Re-Assignments Are Not Allowed.`));
  }

  EmptySyntaxForEvaluator() {
    throw this.ReportError(new Diagnostic(ErrorKind.Evaluator, `Syntax Program Cannot Be Empty.`));
  }

  ValueDoesNotExist(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.Environment, `Value For '${Reference}' Does Not Exist.`));
  }
}
