import { DiagnosticSeverity } from "./diagnostic.severity";

export class Diagnostic {
  constructor(public severity: DiagnosticSeverity, public message: string) {}
}
