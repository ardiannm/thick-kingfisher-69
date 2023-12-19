import { RgbColor } from "../Interpreter/RgbColor";
import { DiagnosticCode } from "./DiagnosticCode";
import { DiagnosticKind } from "./DiagnosticKind";

export class Diagnostic {
  constructor(public Kind: DiagnosticKind, public Code: DiagnosticCode, public Message: string) {
    this.Message = this.Kind + ": " + RgbColor.Moss(this.Message);
  }
}
