import { SourceText } from "../text/source.text";
import { Span } from "../text/span";
import { Severity } from "./severity";

export class Diagnostic {
  private constructor(public text: SourceText, public severity: Severity, public message: string, private span: Span) {}

  public static createFrom(text: SourceText, message: string, severity: Severity, span: Span) {
    return new Diagnostic(text, severity, message, span);
  }

  public get line() {
    return this.text.getLineIndex(this.span.start) + 1;
  }

  public get offset() {
    return this.span.start - this.text.getLineSpan(this.span.start).start + 1;
  }
}
