import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { StatementSyntax } from "./statement.syntax";
import { SyntaxTree } from "../../runtime/syntax.tree";
import { SyntaxNode } from "./syntax.node";

export class BlockScope extends SyntaxNode {
  constructor(
    protected override tree: SyntaxTree,
    public openBrace: SyntaxToken<SyntaxNodeKind.OpenBraceToken>,
    public statements: BlockStatements,
    public closeBrace: SyntaxToken<SyntaxNodeKind.CloseBraceToken>
  ) {
    super(tree, SyntaxNodeKind.BlockScope);
  }
}

export class BlockStatements extends SyntaxNode {
  constructor(protected override tree: SyntaxTree, public members: Array<StatementSyntax>) {
    super(tree, SyntaxNodeKind.BlockStatements);
  }
}
