import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { CellReference, RangeReference, ReferenceDeclaration, SyntaxNode, SyntaxTree } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

export class Binder {
  constructor(public Report: Diagnostics) {}

  private Nodes = new Map<string, BoundReferenceDeclaration>();
  private References = new Set<string>();

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
      case SyntaxKind.ReferenceDeclaration:
        return this.BindReferenceDeclaration(Node as Structure & ReferenceDeclaration);
      default:
        this.Report.MissingBindingMethod(Node.Kind);
    }
  }

  private BindReferenceDeclaration(Node: ReferenceDeclaration) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const LeftBound = this.Bind(Node.Left) as BoundWithReference;
        const Ref = LeftBound.Reference; // Capture The Reference

        // Capture All Cell References
        this.References.clear();
        const Expression = this.Bind(Node.Expression);
        const Referencing = Array.from(this.References);
        this.References.clear();

        // Check If References Being Referenced Actually Exist
        for (const Reference of Referencing) {
          if (!this.Nodes.has(Reference)) this.Report.ReferenceCannotBeFound(Reference);
        }
        // Create Node
        const BoundNode = new BoundReferenceDeclaration(Binding.BoundReferenceDeclaration, Ref, Referencing, [], Expression);
        // If The Node Is Already Exsiting Then Copy The ReferencedBy Value
        if (this.Nodes.has(BoundNode.Reference)) {
          BoundNode.ReferencedBy = this.Nodes.get(Ref).ReferencedBy;
        }
        // Finally Set Or OverWrite The Node
        this.Nodes.set(Ref, BoundNode);
        return BoundNode;
      default:
        this.Report.CannotReferenceNode(Node.Left.Kind, Node.Kind);
    }
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as BoundWithReference;
    const BoundRight = this.Bind(Node.Right) as BoundWithReference;
    return new BoundRangeReference(Binding.BoundRangeReference, BoundLeft.Reference + ":" + BoundRight.Reference);
  }

  private BindCellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    this.References.add(Reference);
    return new BoundCellReference(Binding.BoundCellReference, Reference);
  }

  private BindIdentifier(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundIdentifier(Binding.BoundNumber, Node.Text, Value);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(Binding.BoundNumber, Node.Text, Value);
  }

  private BindSyntaxTree(Node: SyntaxTree) {
    return new BoundSyntaxTree(
      Binding.BoundSyntaxTree,
      Node.Root.map((Expression) => this.Bind(Expression))
    );
  }
}

enum Binding {
  BoundSyntaxTree = "BoundSyntaxTree",
  BoundRangeReference = "BoundRangeReference",
  BoundCellReference = "BoundCellReference",
  BoundIdentifier = "BoundIdentifier",
  BoundNumber = "BoundNumber",
  BoundReferenceDeclaration = "BoundReferenceDeclaration",
}

class BoundNode {
  constructor(public Kind: Binding) {}
}

class BoundSyntaxTree extends BoundNode {
  constructor(public Kind: Binding, public Root: Array<BoundExpression>) {
    super(Kind);
  }
}

class BoundExpression extends BoundNode {}

class BoundWithReference extends BoundExpression {
  constructor(public Kind: Binding, public Reference: string) {
    super(Kind);
  }
}

class BoundNumber extends BoundWithReference {
  constructor(public Kind: Binding, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}

class BoundIdentifier extends BoundWithReference {
  constructor(public Kind: Binding, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}

class BoundCellReference extends BoundWithReference {
  constructor(public Kind: Binding, public Reference: string) {
    super(Kind, Reference);
  }
}

class BoundRangeReference extends BoundExpression {
  constructor(public Kind: Binding, public Reference: string) {
    super(Kind);
  }
}

class BoundReferenceDeclaration extends BoundWithReference {
  constructor(public Kind: Binding, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }
}
