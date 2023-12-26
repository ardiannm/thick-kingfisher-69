import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxNode } from "./SyntaxNode";
import { DiagnosticBag } from "../../DiagnosticBag";

export class Program extends SyntaxNode {
  constructor(
    public override Kind: SyntaxKind.Program,
    public Root: Array<ExpressionSyntax>,
    public Diagnostics: DiagnosticBag
  ) {
    super(Kind);
  }
}
