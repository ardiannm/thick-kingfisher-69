import { Span } from "../text/span";
import { Severity } from "./severity";

export class Diagnostic {
  private constructor(public severity: Severity, public message: string, public span: Span) {}

  public static createFrom(message: string, severity: Severity, span: Span) {
    return new Diagnostic(severity, message, span);
  }
}
