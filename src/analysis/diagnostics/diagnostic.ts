import { SourceText } from "../text/source.text";
import { Span } from "../text/span";
import { Severity } from "./severity";

export class Diagnostic {
  private constructor(public text: SourceText, public severity: Severity, public message: string, public span: Span) {}

  public static createFrom(text: SourceText, message: string, severity: Severity, span: Span) {
    return new Diagnostic(text, severity, message, span);
  }
}
