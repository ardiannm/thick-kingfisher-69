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

  private Links = new Map<string, Array<string>>();
  private Stack = new Set<string>();

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
        // Bind Reference
        const LeftBound = this.Bind(Node.Left) as BoundWithReference;
        // Clear Stack
        this.Stack.clear();
        // Run Binder For Expresion
        const Expression = this.Bind(Node.Expression);
        // Prevent Using Before Its Declaration
        if (this.Stack.has(LeftBound.Reference)) this.Logger.UsedBeforeDeclaration(LeftBound.Reference);
        // Referencing In Array Form
        const Referencing = Array.from(this.Stack);
        // Check If References Being Referenced Actually Exist
        Referencing.forEach((Ref) => {
          if (!this.Links.has(Ref)) this.Logger.ReferenceCannotBeFound(Ref);
        });
        // Save Links
        this.Links.set(LeftBound.Reference, Referencing);
        // Check For Circular Dependency Issues
        this.CircularReferencing(LeftBound.Reference, Referencing);
        // Clear Stack
        this.Stack.clear();
        return new BoundReferenceAssignment(BoundKind.BoundReferenceAssignment, LeftBound.Reference, Referencing, [], Expression);
      default:
        this.Logger.CantUseAsAReference(Node.Left.Kind);
    }
  }

  private CircularReferencing(Reference: string, Links: Array<string>) {
    if (Links.includes(Reference)) {
      this.Logger.CircularDependency(Reference);
    }
    Links.forEach((Link) => this.CircularReferencing(Reference, this.Links.get(Link)));
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
    this.Stack.add(Reference);
    return new BoundCellReference(BoundKind.BoundCellReference, Reference);
  }

  private BindIdentifier(Node: SyntaxToken) {
    return new BoundIdentifier(BoundKind.BoundIdentifier, Node.Text, Node.Text);
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
