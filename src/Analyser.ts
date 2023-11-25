import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { BinaryExpression, CellReference, ParenthesizedExpression, ReferenceExpression, SyntaxNode, SyntaxTree } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

enum AnalysisKind {
  // KindsOfAnalysis
  AnalysedCellReference = "AnalysedCellReference",
  AnalysedReferenceExpression = "AnalysedReferenceExpression",
  AnalysedBinaryExpression = "AnalysedBinaryExpression",
}

enum Operations {
  // Operations
  Addition = "Addition",
  Subtraction = "Subtraction",
  Multiplication = "Multiplication",
  Division = "Division",
}

class AnalysedSyntax {
  constructor(public Kind: AnalysisKind) {}
}

class AnalysedReferenceExpression extends AnalysedSyntax {
  constructor(public Kind: AnalysisKind, public Reference: SyntaxNode, public Expression: SyntaxNode, public Referencing: Array<string>) {
    super(Kind);
  }
}

class AnalysedCellReference extends AnalysedSyntax {
  constructor(public Kind: AnalysisKind, public Reference: string) {
    super(Kind);
  }
}

class AnalysedBinaryExpression extends AnalysedSyntax {
  constructor(public Kind: AnalysisKind, public Left: AnalysedSyntax, public Operation: Operations) {
    super(Kind);
  }
}

export class Analyser {
  private ReferenceStack = new Set<string>();

  public Analyse<Structure extends SyntaxNode>(Node: Structure) {
    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.SyntaxTree(Node as Structure & SyntaxTree);
      case SyntaxKind.CellReference:
        return this.CellReference(Node as Structure & CellReference);
      case SyntaxKind.ReferenceExpression:
        return this.ReferenceExpression(Node as Structure & ReferenceExpression);
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Structure & BinaryExpression);
      case SyntaxKind.ParenthesizedExpression:
        return this.ParenthesizedExpression(Node as Structure & ParenthesizedExpression);
      case SyntaxKind.NumberToken:
      case SyntaxKind.IdentifierToken:
        return this.LiteralToken(Node as Structure & SyntaxToken);
      default:
        console.log(`AnalyserError: Method For Analyzing <${Node.Kind}> Is Missing.`);
        return Node;
    }
  }

  private SyntaxTree(Node: SyntaxTree) {
    Node.Root = this.Analyse(Node.Root);
    return Node;
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

  private BinaryExpression(Node: BinaryExpression) {
    var Operator = this.AnalyseOperator(Node.Operator);
    return new AnalysedBinaryExpression(AnalysisKind.AnalysedBinaryExpression, this.Analyse(Node.Left), Operator);
  }

  private ParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Analyse(Node.Expression);
  }

  private LiteralToken(Node: SyntaxToken) {
    return Node;
  }

  private AnalyseOperator(Node: SyntaxNode) {
    switch (Node.Kind) {
      case SyntaxKind.PlusToken:
        return Operations.Addition;
      case SyntaxKind.MinusToken:
        return Operations.Subtraction;
      case SyntaxKind.StarToken:
        return Operations.Multiplication;
      case SyntaxKind.SlashToken:
        return Operations.Division;
    }
  }
}
