import { DiagnoseKind } from "./DiagnosticKind";

export class Diagnose {
  constructor(public Kind: DiagnoseKind, public Message: string) {
    this.Message = `${this.Kind}: ${Message}`;
  }
}
