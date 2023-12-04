import { SyntaxNode } from "./SyntaxNode";

export class SyntaxBranch {
  constructor(public Node: SyntaxNode, public isLast: boolean) {}
}
