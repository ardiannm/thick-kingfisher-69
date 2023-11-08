import { SyntaxKind } from "./Syntax";

export class SyntaxToken {
  constructor(public kind: SyntaxKind, public repr: string) {}
}
