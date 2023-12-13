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
import { IsReferable } from "./Binding/IsReferable";
import { UnaryExpression } from "./Syntax/UnaryExpression";
import { BoundUnaryExpression } from "./Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./Binding/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "./Syntax/ParenthesizedExpression";
import { BoundNode } from "./Binding/BoundNode";
import { Program } from "./Syntax/Program";
import { BoundStatement } from "./Binding/BoundStatement";
import { BoundProgram } from "./Binding/BoundProgram";
import { BoundScope } from "./Binding/BoundScope";
import { BoundIsStatement } from "./Binding/BoundIsStatement";
import { DiagnosticKind } from "./Diagnostics/DiagnosticKind";

export class Binder {
  private Diagnostics: DiagnosticBag = new DiagnosticBag(DiagnosticKind.Binder);
  private Scope: BoundScope = new BoundScope();

  Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.Program:
        return this.BindProgram(Node as NodeType<Program>);
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
      case SyntaxKind.IsStatement:
        return this.BindIsStatement(Node as NodeType<DeclarationStatement>);
    }
    throw this.Diagnostics.MissingBindingMethod(Node.Kind);
  }

  private BindProgram(Node: Program) {
    if (Node.Root.length === 0) {
      throw this.Diagnostics.EmptyProgram();
    }
    const BoundStatements = new Array<BoundStatement>();
    for (const Statement of Node.Root) {
      const Bound = this.Bind(Statement);
      switch (Bound.Kind) {
        case BoundKind.BoundCellReference:
          this.Scope.Assert((Bound as BoundCellReference).Name);
      }
      BoundStatements.push(Bound);
    }
    return new BoundProgram(BoundKind.BoundProgram, BoundStatements, this.Scope.Dependencies);
  }

  private BindIsStatement(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        this.Scope.CearNames();
        const Expression = this.Bind(Node.Expression);
        this.Scope.RegisterDependencies(Left.Name, this.Scope.Names);
        const Bound = new BoundIsStatement(BoundKind.BoundIsStatement, Left.Name, Expression, new Set<string>(this.Scope.Names));
        this.Scope.CearNames();
        return Bound;
    }
    throw this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindBinaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, Left, Operator, Right);
  }

  private BindBinaryOperatorKind(Kind: SyntaxKind): BoundBinaryOperatorKind {
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
    const BoundLeft = this.Bind(Node.Left) as IsReferable;
    const BoundRight = this.Bind(Node.Right) as IsReferable;
    return new BoundRangeReference(BoundKind.BoundRangeReference, BoundLeft.Name + ":" + BoundRight.Name);
  }

  private BindCellReference(Node: CellReference) {
    const Name = Node.Left.Text + Node.Right.Text;
    this.Scope.ReferToThis(Name);
    return new BoundCellReference(BoundKind.BoundCellReference, Name);
  }

  private BindIdentifier(Node: SyntaxToken) {
    return new BoundIdentifier(BoundKind.BoundIdentifier, Node.Text, Node.Text);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.BoundNumber, Value);
  }
}
