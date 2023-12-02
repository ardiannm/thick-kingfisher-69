import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { CellReference, RangeReference, SyntaxNode, SyntaxTree } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

export class Binder {
  constructor(public Report: Diagnostics) {}

  private DeclarationsStack = new Set<string>();

  Bind<Structure extends SyntaxNode>(Node: Structure): BoundNode {
    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.BindSyntaxTree(Node as Structure & SyntaxTree);
      case SyntaxKind.IdentifierToken:
        return this.BindIdentifier(Node as Structure & SyntaxToken);
      case SyntaxKind.NumberToken:
        return this.BindNumber(Node as Structure & SyntaxToken);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as Structure & CellReference);
      case SyntaxKind.RangeReference:
        return this.BindRangeReference(Node as Structure & RangeReference);
      default:
        this.Report.MissingBindingMethod(Node.Kind);
    }
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as BoundLiteral;
    const BoundRight = this.Bind(Node.Right) as BoundLiteral;
    return new BoundRangeReference(BindKind.BoundRangeReference, BoundLeft.Reference + ":" + BoundRight.Reference);
  }

  private BindCellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    this.DeclarationsStack.add(Reference);
    return new BoundCellReference(BindKind.BoundCellReference, Reference);
  }

  private BindIdentifier(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundIdentifier(BindKind.BoundNumber, Node.Text, Value);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BindKind.BoundNumber, Node.Text, Value);
  }

  private BindSyntaxTree(Node: SyntaxTree) {
    return new BoundSyntaxTree(BindKind.BoundSyntaxTree, this.Bind(Node.Root));
  }
}

enum BindKind {
  BoundSyntaxTree = "BoundSyntaxTree",
  BoundRangeReference = "BoundRangeReference",
  BoundCellReference = "BoundCellReference",
  BoundIdentifier = "BoundIdentifier",
  BoundNumber = "BoundNumber",
}

class BoundNode {
  constructor(public Kind: BindKind) {}
}

class BoundSyntaxTree extends BoundNode {
  constructor(public Kind: BindKind, public Root: BoundExpression) {
    super(Kind);
  }
}

class BoundExpression extends BoundNode {}

class BoundLiteral extends BoundExpression {
  constructor(public Kind: BindKind, public Reference: string) {
    super(Kind);
  }
}

class BoundNumber extends BoundLiteral {
  constructor(public Kind: BindKind, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}

class BoundIdentifier extends BoundLiteral {
  constructor(public Kind: BindKind, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}

class BoundCellReference extends BoundLiteral {
  constructor(public Kind: BindKind, public Reference: string) {
    super(Kind, Reference);
  }
}

class BoundRangeReference extends BoundExpression {
  constructor(public Kind: BindKind, public Reference: string) {
    super(Kind);
  }
}
