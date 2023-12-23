import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";
import { DiagnosticBag } from "../../DiagnosticBag";

export class Program extends SyntaxNode {
  constructor(
    public Kind: SyntaxKind.Program,
    public Root: Array<ExpressionSyntax>,
    public EndOfFileToken: SyntaxToken<SyntaxKind.EndOfFileToken>,
    public Diagnostics: DiagnosticBag
  ) {
    super(Kind);
  }
}
