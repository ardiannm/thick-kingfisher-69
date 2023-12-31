import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundProgram extends BoundStatement {
  constructor(
    public override Kind: BoundKind.Program,
    public Root: Array<BoundStatement>,
    public Diagnostics: DiagnosticBag
  ) {
    super(Kind);
  }
}
