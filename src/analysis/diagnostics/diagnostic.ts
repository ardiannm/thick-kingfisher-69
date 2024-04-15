import { DiagnosticSeverity } from "./diagnostic.severity";

export class Diagnostic {
  constructor(public Severity: DiagnosticSeverity, public Message: string) {}
}
