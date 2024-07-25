import { Severity } from "./severity";

export class Diagnostic {
  private constructor(public severity: Severity, public message: string) {}

  public static createFrom(message: string, severity: Severity) {
    return new Diagnostic(severity, message);
  }
}
