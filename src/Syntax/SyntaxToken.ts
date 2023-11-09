import { SyntaxKind } from "./SyntaxKind";

export class SyntaxToken {
  constructor(public kind: SyntaxKind, public text: string) {}
}
