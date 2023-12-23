import { DiagnosticKind } from "./DiagnosticKind";

export class Diagnostic {
  constructor(public Code: DiagnosticKind, public Message: string) {
    this.Message = Code + ": " + this.Message;
  }
}
