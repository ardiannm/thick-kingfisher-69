import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxNode, SyntaxTree } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

export class Binder {
  constructor(public Report: Diagnostics) {}

  Bind<Structure extends SyntaxNode>(Node: Structure) {
    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.BindSyntaxTree(Node as Structure & SyntaxTree);
      case SyntaxKind.NumberToken:
        return this.BindNumberExpression(Node as Structure & SyntaxToken);
      default:
        this.Report.MissingBindingMethod(Node.Kind);
    }
  }

  private BindSyntaxTree(Node: SyntaxTree) {
    return new BoundSyntaxTree(Binding.BoundSyntaxTree, this.Bind(Node.Root));
  }

  private BindNumberExpression(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumberExpression(Binding.BoundNumberExpression, Value);
  }
}

enum Binding {
  BoundSyntaxTree,
  BoundNumberExpression,
}

class BoundNode {
  constructor(public Kind: Binding) {}
}

class BoundSyntaxTree extends BoundNode {
  constructor(public Kind: Binding, public Root: BoundExpression) {
    super(Kind);
  }
}

class BoundExpression extends BoundNode {}

class BoundNumberExpression extends BoundExpression {
  constructor(public Kind: Binding, public Value: number) {
    super(Kind);
  }
}
