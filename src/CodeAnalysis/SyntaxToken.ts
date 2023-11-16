import { SyntaxKind } from "./SyntaxKind";

export class SyntaxToken {
  constructor(public Kind: SyntaxKind, public Text: string) {}
}
