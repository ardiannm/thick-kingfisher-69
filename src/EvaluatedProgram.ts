import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class EvaluatedProgram {
  constructor(public Value = 0, public Diagnostics = new DiagnosticBag()) {}
}
