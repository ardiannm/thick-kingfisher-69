import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";

export class SyntaxToken extends Expression {
  constructor(public Kind: SyntaxKind, public Text: string) {
    super(Kind);
  }
}
