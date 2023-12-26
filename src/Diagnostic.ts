import { DiagnosticPhase } from "./DiagnosticPhase";
import { DiagnosticKind } from "./DiagnosticKind";

export class Diagnostic {
  constructor(public Phase: DiagnosticPhase, public Kind: DiagnosticKind, public Message: string) {}

  get Print() {
    return this.Phase + ": " + this.Message;
  }
}
