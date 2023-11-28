import { SyntaxKind } from "../SyntaxKind";
import { SyntaxToken } from "../SyntaxToken";
import { ErrorKind } from "./ErrorKind";
import { Diagnostic } from "./Diagnostic";

export class Diagnostics {
  private Bag = new Array<Diagnostic>();

  Any() {
    return this.Bag.length > 0;
  }

  Show() {
    for (const d of this.Bag) this.Log(d.Message);
  }

  Clear() {
    this.Bag = new Array<Diagnostic>();
  }

  Log(tree: Object = "") {
    console.log("\n" + `${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}` + "\n");
  }

  private ReportError(Err: Diagnostic) {
    this.Bag.push(Err);
    return Err;
  }

  BadTokenFound(Token: SyntaxToken) {
    return this.ReportError(new Diagnostic(ErrorKind.ParserError, `Bad Character '${Token.Text}' Found.`));
  }

  TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind) {
    return this.ReportError(new Diagnostic(ErrorKind.ParserError, `Expected <${Expected}>; Found <${Matched}>.`));
  }

  UndeclaredVariable(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.EnvironmentError, `Reference '${Reference}' Has Not Been Declared.`));
  }

  MethodNotImplemented(Kind: SyntaxKind) {
    throw this.ReportError(new Diagnostic(ErrorKind.EvaluatorError, `Method For Evaluating <${Kind}> Is Missing.`));
  }

  NotAnOperator(Kind: SyntaxKind) {
    return this.ReportError(new Diagnostic(ErrorKind.EvaluatorError, `Node <${Kind}> Is Not An Operator Token.`));
  }

  CircularDependency(Reference: string) {
    throw this.ReportError(new Diagnostic(ErrorKind.EnvironmentError, `Circular Dependency For '${Reference}' Detected.`));
  }
}
