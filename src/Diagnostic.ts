import { DiagnosticPhase } from "./DiagnosticPhase";
import { DiagnosticKind } from "./DiagnosticKind";

export class Diagnostic {
  constructor(Phase: DiagnosticPhase, public Kind: DiagnosticKind, public Message: string) {
    this.Message = Phase + ": " + this.Message;
  }
}
