import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxNode } from "./Syntax/SyntaxNode";
import { DeclarationStatement } from "./Syntax/DeclarationStatement";
import { BinaryExpression } from "./Syntax/BinaryExpression";
import { RangeReference } from "./Syntax/RangeReference";
import { CellReference } from "./Syntax/CellReference";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { BoundBinaryExpression } from "./Binding/BoundBinaryExpression";
import { BoundCellReference } from "./Binding/BoundCellReference";
import { BoundIdentifier } from "./Binding/BoundIdentifier";
import { BoundKind } from "./Binding/BoundKind";
import { BoundNumber } from "./Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./Binding/BoundBinaryOperatorKind";
import { BoundRangeReference } from "./Binding/BoundRangeReference";
import { HasReference } from "./Binding/HasReference";
import { UnaryExpression } from "./Syntax/UnaryExpression";
import { BoundUnaryExpression } from "./Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./Binding/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "./Syntax/ParenthesizedExpression";
import { BoundNode } from "./Binding/BoundNode";
import { BoundDeclarationStatement } from "./Binding/BoundDeclarationStatement";

export class Binder {
  private Diagnostics: DiagnosticBag = new DiagnosticBag();
  private Stack = new Set<string>();
  private Map = new Map<string, Set<string>>();

  Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
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
      case SyntaxKind.DeclarationStatement:
        return this.BindDeclarationStatement(Node as NodeType<DeclarationStatement>);
    }
    throw this.Diagnostics.MissingBindingMethod(Node.Kind);
  }

  private BindDeclarationStatement(Node: DeclarationStatement) {
    const Kind = this.BindDeclarationKind(Node.Keyword.Kind);
    switch (Kind) {
      case BoundKind.IsStatement:
        return this.BindIsStatement(Node);
    }
    throw this.Diagnostics.MissingDeclarationStatement(Kind);
  }

  private BindDeclarationKind(Kind: SyntaxKind): BoundKind {
    switch (Kind) {
      case SyntaxKind.IsKeyword:
        return BoundKind.IsStatement;
      case SyntaxKind.CopyKeyword:
        return BoundKind.CopyStatement;
    }
    throw this.Diagnostics.MissingBindingMethod(Kind);
  }

  private BindIsStatement(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        this.Stack.clear();
        const Expression = this.Bind(Node.Expression);
        Left.Reference;

        this.Stack.clear();
        return new BoundDeclarationStatement(BoundKind.IsStatement, Left, Expression);
    }
    throw this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, Left, Operator, Right);
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
    }
    throw this.Diagnostics.MissingOperatorKind(Kind);
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    const Operator = this.BindUnaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundUnaryExpression(BoundKind.BoundUnaryExpression, Operator, Right);
  }

  private BindUnaryOperatorKind(Kind: SyntaxKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
    throw this.Diagnostics.MissingOperatorKind(Kind);
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as HasReference;
    const BoundRight = this.Bind(Node.Right) as HasReference;
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
}
