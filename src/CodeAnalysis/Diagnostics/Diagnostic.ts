import { DiagnosticKind } from "./DiagnosticKind";

export class Diagnostic {
  constructor(public Kind: DiagnosticKind, public Message: string) {
    this.Message = `${this.Kind}: ${Message}`;
  }
}
