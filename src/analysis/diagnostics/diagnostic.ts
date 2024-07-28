import { SourceText } from "../text/source.text";
import { Span } from "../text/span";
import { Severity } from "./severity";

export class Diagnostic {
  private constructor(private text: SourceText, public severity: Severity, public message: string, public span: Span) {}

  public static createFrom(text: SourceText, message: string, severity: Severity, location: Span) {
    return new Diagnostic(text, severity, message, location);
  }

  public get line() {
    return this.text.getLineSpan(this.span.start);
  }
}
