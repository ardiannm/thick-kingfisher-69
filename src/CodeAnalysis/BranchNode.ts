import { SyntaxNode } from "./SyntaxNode";

export class BranchNode {
  constructor(public Node: SyntaxNode, public isLast: boolean) {}
}
