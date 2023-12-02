import { Diagnostics } from "../Diagnostics/Diagnostics";
import { SyntaxKind } from "../SyntaxKind";
import { SyntaxNode } from "../SyntaxNode";
import { SyntaxTree } from "../SyntaxTree";
import { BindReferenceAssignment } from "../BindReferenceAssignment";
import { BinaryExpression } from "../BinaryExpression";
import { RangeReference } from "../RangeReference";
import { CellReference } from "../CellReference";
import { SyntaxToken } from "../SyntaxToken";
import { BoundBinaryExpression } from "./BoundBinaryExpression";
import { BoundCellReference } from "./BoundCellReference";
import { BoundIdentifier } from "./BoundIdentifier";
import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";
import { BoundNumber } from "./BoundNumber";
import { BoundOperatorKind } from "./BoundOperatorKind";
import { BoundRangeReference } from "./BoundRangeReference";
import { BoundReferenceAssignment } from "./BoundReferenceAssignment";
import { BoundSyntaxTree } from "./BoundSyntaxTree";
import { BoundWithReference } from "./BoundWithReference";

export class Binder {
  constructor(public Report: Diagnostics) {}

  private Nodes = new Map<string, BoundReferenceAssignment>();
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
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Structure & BinaryExpression);
      case SyntaxKind.ReferenceDeclaration:
        return this.BindReferenceAssignment(Node as Structure & BindReferenceAssignment);
      default:
        this.Report.MissingBindingMethod(Node.Kind);
    }
  }

  private BindReferenceAssignment(Node: BindReferenceAssignment) {
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

        this.CheckDependency(Ref, Referencing);

        const BoundNode = new BoundReferenceAssignment(BoundKind.BoundReferenceAssignment, Ref, Referencing, [], Expression);
        this.Nodes.set(Ref, BoundNode);
        return BoundNode;
      default:
        this.Report.CannotReferenceNode(Node.Left.Kind, Node.Kind);
    }
  }

  private CheckDependency(Reference: string, Referencing: Array<string>) {
    if (Referencing.includes(Reference)) this.Report.CircularDependency(Reference);
    Referencing.forEach((Ref) => this.CheckDependency(Reference, this.Nodes.get(Ref).Referencing));
  }

  private BinaryExpression(Node: BinaryExpression) {
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, this.Bind(Node.Left), this.BindOperatorKind(Node.Operator.Kind), this.Bind(Node.Right));
  }

  private BindOperatorKind(Kind: SyntaxKind): BoundOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundOperatorKind.Addition;
      case SyntaxKind.MinusToken:
        return BoundOperatorKind.Subtraction;
      case SyntaxKind.StarToken:
        return BoundOperatorKind.Multiplication;
      case SyntaxKind.SlashToken:
        return BoundOperatorKind.Division;
      default:
        this.Report.NotAnOperator(Kind);
    }
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as BoundWithReference;
    const BoundRight = this.Bind(Node.Right) as BoundWithReference;
    return new BoundRangeReference(BoundKind.BoundRangeReference, BoundLeft.Reference + ":" + BoundRight.Reference);
  }

  private BindCellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    this.References.add(Reference);
    return new BoundCellReference(BoundKind.BoundCellReference, Reference);
  }

  private BindIdentifier(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundIdentifier(BoundKind.BoundNumber, Node.Text, Value);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.BoundNumber, Node.Text, Value);
  }

  private BindSyntaxTree(Node: SyntaxTree) {
    return new BoundSyntaxTree(
      BoundKind.BoundSyntaxTree,
      Node.Root.map((Expression) => this.Bind(Expression))
    );
  }
}
