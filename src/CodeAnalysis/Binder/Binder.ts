import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { SyntaxKind } from "../Parser/SyntaxKind";
import { SyntaxNode } from "../Parser/SyntaxNode";
import { DeclarationStatement } from "../Parser/DeclarationStatement";
import { BinaryExpression } from "../Parser/BinaryExpression";
import { RangeReference } from "../Parser/RangeReference";
import { CellReference } from "../Parser/CellReference";
import { SyntaxToken } from "../Parser/SyntaxToken";
import { BoundBinaryExpression } from "./BoundBinaryExpression";
import { BoundCellReference } from "./BoundCellReference";
import { BoundIdentifier } from "./BoundIdentifier";
import { BoundKind } from "./BoundKind";
import { BoundNumber } from "./BoundNumber";
import { BoundBinaryOperatorKind } from "./BoundBinaryOperatorKind";
import { BoundRangeReference } from "./BoundRangeReference";
import { UnaryExpression } from "../Parser/UnaryExpression";
import { BoundUnaryExpression } from "./BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "../Parser/ParenthesizedExpression";
import { BoundNode } from "./BoundNode";
import { Program } from "../Parser/Program";
import { BoundStatement } from "./BoundStatement";
import { BoundProgram } from "./BoundProgram";
import { BoundScope } from "./BoundScope";
import { BoundReferenceStatement } from "./BoundReferenceStatement";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { BoundRowReference } from "./BoundRowReference";
import { BoundColumnReference } from "./BoundColumnReference";
import { IsReferable } from "./IsReferable";

export class Binder {
  private Diagnostics: DiagnosticBag = new DiagnosticBag(DiagnosticKind.Binder);
  private Scope: BoundScope = new BoundScope(undefined);

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
      case SyntaxKind.ReferenceStatement:
        return this.BindReferenceStatement(Node as NodeType<DeclarationStatement>);
    }
    throw this.Diagnostics.MissingMethod(Node.Kind);
  }

  private BindProgram(Node: Program) {
    if (Node.Root.length === 0) {
      throw this.Diagnostics.ProgramIsEmpty();
    }
    const Root = new Array<BoundStatement>();
    for (const Branch of Node.Root) {
      switch (Branch.Kind) {
        case SyntaxKind.CellReference:
        case SyntaxKind.ReferenceStatement:
        case SyntaxKind.UnaryExpression:
        case SyntaxKind.BinaryExpression:
          Root.push(this.Bind(Branch));
          continue;
        default:
          throw this.Diagnostics.CantWriteExpression(Branch.Kind);
      }
    }
    return new BoundProgram(BoundKind.Program, Root, this.Scope);
  }

  private BindReferenceStatement(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        this.Scope = new BoundScope(this.Scope);
        const Expression = this.Bind(Node.Expression);
        const Bound = new BoundReferenceStatement(BoundKind.ReferenceStatement, Left.Name, Expression, new Set<string>(this.Scope.Names));
        this.Scope = this.Scope.Parent as BoundScope;
        this.Scope.TryDeclareCell(Bound.Name, Bound.Dependencies);
        return Bound;
    }
    throw this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindBinaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BinaryExpression, Left, Operator, Right);
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
    const Right = this.Bind(Node.Right) as BoundNumber;
    switch (Operator) {
      case BoundUnaryOperatorKind.Negation:
        switch (Node.Right.Kind) {
          case SyntaxKind.NumberToken:
            return new BoundNumber(BoundKind.Number, -Right.Value);
          default:
            throw this.Diagnostics.MissingMethod(Node.Right.Kind);
        }
      case BoundUnaryOperatorKind.Identity:
        return Right;
    }
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

  private BindRangeMember<Kind extends SyntaxNode>(Node: Kind) {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        return new BoundRowReference(BoundKind.RowReference, (Node as NodeType<SyntaxToken>).Text);
      case SyntaxKind.IdentifierToken:
        return new BoundColumnReference(BoundKind.ColumnReference, (Node as NodeType<SyntaxToken>).Text);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
    }
    throw this.Diagnostics.NotARangeMember(Node.Kind);
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.BindRangeMember(Node.Left);
    const BoundRight = this.BindRangeMember(Node.Right);
    return new BoundRangeReference(BoundKind.RangeReference, BoundLeft.Kind + ":" + BoundRight.Name);
  }

  private BindCellReference(Node: CellReference) {
    const BoundLeft = this.BindRangeMember(Node.Left) as IsReferable;
    const BoundRight = this.BindRangeMember(Node.Right) as IsReferable;
    const Name = BoundLeft.Name + BoundRight.Name;
    this.Scope.PushCell(Name);
    return new BoundCellReference(BoundKind.CellReference, Name);
  }

  private BindIdentifier(Node: SyntaxToken) {
    return new BoundIdentifier(BoundKind.Identifier, Node.Text);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.Number, Value);
  }
}
