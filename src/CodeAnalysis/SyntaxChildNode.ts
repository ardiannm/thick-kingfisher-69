import { SyntaxNode } from "./SyntaxNode";

export class SyntaxChildNode {
  constructor(public Node: SyntaxNode, public isLast: boolean) {}
}
