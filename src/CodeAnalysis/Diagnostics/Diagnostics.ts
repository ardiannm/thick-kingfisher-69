import { SyntaxKind } from "../SyntaxKind";
import { SyntaxToken } from "../SyntaxToken";
import { ErrorKind } from "./ErrorKind";

export class Diagnostic {
  constructor(public Kind: ErrorKind, public Message: string) {
    this.Message = `${this.Kind}: ${Message}`;
  }
}

export class Diagnostics {
  private Bag = new Array<Diagnostic>();

  Any() {
    return this.Bag.length > 0;
  }

  Show() {
    for (const d of this.Bag) this.Report(d.Message);
  }

  Clear() {
    this.Bag = new Array<Diagnostic>();
  }

  Report(tree: Object = "") {
    console.log("\n" + `${typeof tree === "string" ? tree : JSON.stringify(tree, undefined, 2)}` + "\n");
  }

  private ReportError(Err: Diagnostic) {
    this.Bag.push(Err);
    return Err;
  }

  public BadTokenFound(Token: SyntaxToken): Diagnostic {
    return this.ReportError(new Diagnostic(ErrorKind.ParserError, `Bad Character '${Token.Text}' Found.`));
  }

  public TokenNotAMatch(Expected: SyntaxKind, Matched: SyntaxKind): Diagnostic {
    return this.ReportError(new Diagnostic(ErrorKind.ParserError, `Expected <${Expected}>; Found <${Matched}>.`));
  }

  public VarUndefined(Reference: string): Diagnostic {
    throw this.ReportError(new Diagnostic(ErrorKind.EnviromentError, `Variable '${Reference}' Is Undefined.`));
  }

  public NodeEvaluationMethodIsMissing(Kind: SyntaxKind): Diagnostic {
    return this.ReportError(new Diagnostic(ErrorKind.EvaluatorError, `Node For Evaluating <${Kind}> Is Missing.`));
  }

  public NotAnOperator(Kind: SyntaxKind): Diagnostic {
    return this.ReportError(new Diagnostic(ErrorKind.EvaluatorError, `Node <${Kind}> Is Not An Operator Token.`));
  }
}
