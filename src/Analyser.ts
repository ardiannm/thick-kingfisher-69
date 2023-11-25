import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { CellReference, ReferenceExpression, SyntaxNode, SyntaxTree } from "./CodeAnalysis/SyntaxNode";

enum AnalysisKind {
  AnalysedTree = "AnalysedTree",
  AnalysedCellReference = "AnalysedCellReference",
  AnalysedReferenceExpression = "AnalysedReferenceExpression",
}

class AnalysedNode {
  constructor(public Kind: AnalysisKind) {}
}

class AnalysedTree extends AnalysedNode {
  constructor(public Kind: AnalysisKind, public Root: AnalysedNode) {
    super(Kind);
  }
}

class AnalysedReferenceExpression extends AnalysedNode {
  constructor(public Kind: AnalysisKind, public Reference: SyntaxNode, public Expression: SyntaxNode, public Referencing: Array<string>) {
    super(Kind);
  }
}

class AnalysedCellReference extends AnalysedNode {
  constructor(public Kind: AnalysisKind, public Reference: string) {
    super(Kind);
  }
}

export class Analyser {
  private ReferenceStack = new Set<string>();

  public Analyse<Node extends SyntaxNode>(Node: Node) {
    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.SyntaxTree(Node as Node & SyntaxTree);
      case SyntaxKind.CellReference:
        return this.CellReference(Node as Node & CellReference);
      case SyntaxKind.ReferenceExpression:
        return this.ReferenceExpression(Node as Node & ReferenceExpression);
      default:
        console.log(`AnalyserError: Method For Analyzing <${Node.Kind}> Is Missing.`);
    }
  }

  private SyntaxTree(Node: SyntaxTree) {
    return new AnalysedTree(AnalysisKind.AnalysedTree, this.Analyse(Node.Root));
  }

  private CellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    this.ReferenceStack.add(Reference);
    return new AnalysedCellReference(AnalysisKind.AnalysedCellReference, Reference);
  }

  private ReferenceExpression(Node: ReferenceExpression) {
    const Reference = this.Analyse(Node.Reference);
    this.ReferenceStack.clear();
    const Expression = this.Analyse(Node.Expression);
    const Referencing = Array.from(this.ReferenceStack);
    this.ReferenceStack.clear();
    return new AnalysedReferenceExpression(AnalysisKind.AnalysedReferenceExpression, Reference, Expression, Referencing);
  }
}
