import { TextSpan } from "../../lexing/text.span";
import { Severity } from "./severity";

export class Diagnostic {
  constructor(public severity: Severity, public message: string, public span: TextSpan) {}

  public static createFrom(message: string, severity: Severity, span: TextSpan) {
    return new Diagnostic(severity, message, span);
  }
}
