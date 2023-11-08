import { Syntax } from "./Syntax";

export class SyntaxToken {
  constructor(public kind: Syntax, public repr: string) {}
}
