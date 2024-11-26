import { Span } from "../../lexing/span";
import { Severity } from "./severity";

export class Diagnostic {
  constructor(public severity: Severity, public message: string, public span: Span) {}

  public static createFrom(message: string, severity: Severity, span: Span) {
    return new Diagnostic(severity, message, span);
  }

  viewMessage() {
    return `${this.span.line}:${this.span.column}    ${this.message}`;
  }
}
