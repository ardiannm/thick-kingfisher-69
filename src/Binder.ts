import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxNode } from "./CodeAnalysis/SyntaxNode";
import { SyntaxTree } from "./CodeAnalysis/SyntaxTree";
import { ReferenceAssignment } from "./CodeAnalysis/ReferenceAssignment";
import { BinaryExpression } from "./CodeAnalysis/BinaryExpression";
import { RangeReference } from "./CodeAnalysis/RangeReference";
import { CellReference } from "./CodeAnalysis/CellReference";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundIdentifier } from "./CodeAnalysis/Binding/BoundIdentifier";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundRangeReference } from "./CodeAnalysis/Binding/BoundRangeReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { BoundSyntaxTree } from "./CodeAnalysis/Binding/BoundSyntaxTree";
import { BoundWithReference } from "./CodeAnalysis/Binding/BoundWithReference";
import { UnaryExpression } from "./CodeAnalysis/UnaryExpression";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "./CodeAnalysis/ParenthesizedExpression";

export class Binder {
  constructor(public Logger: Diagnostics) {}

  private Dependencies = new Map<string, Array<string>>();
  private References = new Set<string>();

  Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;

    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.BindSyntaxTree(Node as NodeType<SyntaxTree>);
      case SyntaxKind.IdentifierToken:
        return this.BindIdentifier(Node as NodeType<SyntaxToken>);
      case SyntaxKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken>);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
      case SyntaxKind.RangeReference:
        return this.BindRangeReference(Node as NodeType<RangeReference>);
      case SyntaxKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.UnaryExpression:
        return this.BindUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.BinaryExpression:
        return this.BindBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.ReferenceAssignment:
        return this.BindReferenceAssignment(Node as NodeType<ReferenceAssignment>);
      default:
        this.Logger.MissingBindingMethod(Node.Kind);
    }
  }

  private BindReferenceAssignment(Node: ReferenceAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const LeftBound = this.Bind(Node.Left) as BoundWithReference;
        const Ref = LeftBound.Reference; // Capture The Reference

        // Capture Cell References
        this.References.clear();
        const Expression = this.Bind(Node.Expression);
        const Referencing = Array.from(this.References);
        this.References.clear();

        // Check For Circular Dependency Issues
        this.CheckDependency(Ref, Referencing);

        // Check If References Being Referenced Actually Exist
        for (const Reference of Referencing) {
          if (!this.Dependencies.has(Reference)) this.Logger.ReferenceCannotBeFound(Reference);
        }

        this.Dependencies.set(Ref, Referencing);

        return new BoundReferenceAssignment(BoundKind.BoundReferenceAssignment, Ref, Referencing, [], Expression);
      default:
        this.Logger.CannotReferenceNode(Node.Left.Kind, Node.Kind);
    }
  }

  private CheckDependency(Reference: string, Referencing: Array<string>) {
    if (Referencing.includes(Reference)) this.Logger.CircularDependency(Reference);
    Referencing.forEach((Ref) => this.CheckDependency(Reference, this.Dependencies.get(Ref)));
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, this.Bind(Node.Left), this.BindOperatorKind(Node.Operator.Kind), this.Bind(Node.Right));
  }

  private BindOperatorKind(Kind: SyntaxKind): BoundBinaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundBinaryOperatorKind.Addition;
      case SyntaxKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction;
      case SyntaxKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication;
      case SyntaxKind.SlashToken:
        return BoundBinaryOperatorKind.Division;
      default:
        this.Logger.NotAnOperator(Kind);
    }
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    return new BoundUnaryExpression(BoundKind.BoundUnaryExpression, this.BindUnaryOperatorKind(Node.Operator.Kind), this.Bind(Node.Right));
  }

  private BindUnaryOperatorKind(Kind: SyntaxKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
      default:
        this.Logger.NotAnOperator(Kind);
    }
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
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
    const Expressions = Node.Expressions.map((Expression) => this.Bind(Expression));
    return new BoundSyntaxTree(BoundKind.BoundSyntaxTree, Expressions);
  }
}
