import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class EvaluationResult {
  constructor(public Value: number, public Diagnostics: DiagnosticBag) {}
}
