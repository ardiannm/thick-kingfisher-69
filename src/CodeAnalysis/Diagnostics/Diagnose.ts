import { DiagnoseKind } from "./DiagnoseKind";

export class Diagnose {
  constructor(public Kind: DiagnoseKind, public Message: string) {
    this.Message = `${this.Kind}: ${Message}`;
  }
}
