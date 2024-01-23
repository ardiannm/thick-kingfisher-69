import { DiagnosticSeverity } from "./DiagnosticSeverity";

export class Diagnostic {
  constructor(public Severity: DiagnosticSeverity, public Message: string) {}
}
