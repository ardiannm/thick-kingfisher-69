import { DiagnosticBag } from "../../DiagnosticBag";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundProgram extends BoundStatement {
  constructor(public Kind: BoundKind.Program, public Root: Array<BoundStatement>, public Diagnostics: DiagnosticBag) {
    super(Kind);
  }
}
