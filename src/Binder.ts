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
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";

// Binder class responsible for binding syntax nodes to their corresponding bound nodes.

export class Binder {
  // Map to store links between reference assignments.
  private Links = new Map<string, Array<string>>();
  // Set to keep track of referenced identifiers to detect circular dependencies.
  private Stack = new Set<string>();

  // Logger for reporting diagnostics and errors during binding.
  public Logger = new Diagnostics();

  // Bind method takes a SyntaxNode and returns the corresponding BoundNode.
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
        throw this.Logger.MissingBindingMethod(Node.Kind);
    }
  }

  // Binding method for ReferenceAssignment syntax node.
  private BindReferenceAssignment(Node: ReferenceAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        // Bind reference.
        const LeftBound = this.Bind(Node.Left) as BoundWithReference;
        // Clear stack.
        this.Stack.clear();
        // Run binder for expression.
        const Expression = this.Bind(Node.Expression);
        // Prevent using before its declaration.
        if (this.Stack.has(LeftBound.Reference)) {
          throw this.Logger.UsedBeforeDeclaration(LeftBound.Reference);
        }
        // Referencing in array form.
        const Referencing = Array.from(this.Stack);
        // Check if references being referenced actually exist.
        Referencing.forEach((Ref) => {
          if (!this.Links.has(Ref)) throw this.Logger.ReferenceCannotBeFound(Ref);
        });
        // Save links.
        this.Links.set(LeftBound.Reference, Referencing);
        // Check for circular dependency issues.
        this.CircularReferencing(LeftBound.Reference, Referencing);
        // Clear stack.
        this.Stack.clear();
        return new BoundReferenceAssignment(BoundKind.BoundReferenceAssignment, LeftBound.Reference, Referencing, [], Expression);
      default:
        throw this.Logger.CantUseAsAReference(Node.Left.Kind);
    }
  }

  // Method to detect circular dependencies in the reference assignment links.
  private CircularReferencing(Reference: string, Links: Array<string>) {
    if (Links.includes(Reference)) {
      throw this.Logger.CircularDependency(Reference);
    }
    Links.forEach((Link) => this.CircularReferencing(Reference, this.Links.get(Link) as Array<string>));
  }

  // Binding method for BinaryExpression syntax node.
  private BindBinaryExpression(Node: BinaryExpression) {
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, this.Bind(Node.Left), this.BindOperatorKind(Node.Operator.Kind), this.Bind(Node.Right));
  }

  // Method to map syntax binary operator kind to bound binary operator kind.
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
        throw this.Logger.MissingOperatorKind(Kind);
    }
  }

  // Binding method for UnaryExpression syntax node.
  private BindUnaryExpression(Node: UnaryExpression) {
    return new BoundUnaryExpression(BoundKind.BoundUnaryExpression, this.BindUnaryOperatorKind(Node.Operator.Kind), this.Bind(Node.Right));
  }

  // Method to map syntax unary operator kind to bound unary operator kind.
  private BindUnaryOperatorKind(Kind: SyntaxKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
      default:
        throw this.Logger.MissingOperatorKind(Kind);
    }
  }

  // Binding method for ParenthesizedExpression syntax node.
  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  // Binding method for RangeReference syntax node.
  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as BoundWithReference;
    const BoundRight = this.Bind(Node.Right) as BoundWithReference;
    return new BoundRangeReference(BoundKind.BoundRangeReference, BoundLeft.Reference + ":" + BoundRight.Reference);
  }

  // Binding method for CellReference syntax node.
  private BindCellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    this.Stack.add(Reference);
    return new BoundCellReference(BoundKind.BoundCellReference, Reference);
  }

  // Binding method for IdentifierToken syntax node.
  private BindIdentifier(Node: SyntaxToken) {
    return new BoundIdentifier(BoundKind.BoundIdentifier, Node.Text, Node.Text);
  }

  // Binding method for NumberToken syntax node.
  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.BoundNumber, Node.Text, Value);
  }

  // Binding method for SyntaxTree syntax node.
  private BindSyntaxTree(Node: SyntaxTree) {
    const Expressions = Node.Expressions.map((Expression) => this.Bind(Expression));
    return new BoundSyntaxTree(BoundKind.BoundSyntaxTree, Expressions);
  }
}
