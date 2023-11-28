import { ErrorKind } from "./ErrorKind";

export class Diagnostic {
  constructor(public Kind: ErrorKind, public Message: string) {
    this.Message = `${this.Kind}: ${Message}`;
  }
}
