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

  constructor(private Scope: BoundScope) {}

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
      case SyntaxKind.CloneStatement:
        return this.BindCloneStatement(Node as NodeType<DeclarationStatement>);
    }
    throw this.Diagnostics.MissingMethod(Node.Kind);
  }

  private BindProgram(Node: Program) {
    if (Node.Root.length === 0) {
      throw this.Diagnostics.SourceCodeIsEmpty();
    }
    const Root = new Array<BoundStatement>();
    for (const Branch of Node.Root) {
      switch (Branch.Kind) {
        case SyntaxKind.NumberToken:
        case SyntaxKind.CellReference:
        case SyntaxKind.ParenthesizedExpression:
        case SyntaxKind.UnaryExpression:
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.ReferenceStatement:
        case SyntaxKind.CloneStatement:
          Root.push(this.Bind(Branch));
          continue;
        default:
          throw this.Diagnostics.CantWriteExpression(Branch.Kind);
      }
    }
    return new BoundProgram(BoundKind.Program, Root);
  }

  private BindCloneStatement(Node: DeclarationStatement) {
    if (Node.Left.Kind !== SyntaxKind.CellReference || Node.Expression.Kind !== SyntaxKind.CellReference) {
      throw this.Diagnostics.CantUseForCopy(Node.Left.Kind, Node.Expression.Kind);
    }
    const Left = this.Bind(Node.Left) as BoundCellReference;
    const Right = this.Bind(Node.Expression) as BoundCellReference;
    const Cell = this.Scope.TryLookUpCell(Right.Name);
    const Dependencies = new Set(Cell.Dependencies);
    Dependencies.add(Right.Name);
    const Data = new BoundReferenceStatement(BoundKind.ReferenceStatement, Left.Name, Cell.Expression, Dependencies);
    this.Scope.TryDeclareCell(Data);
    return Data;
  }

  private BindReferenceStatement(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        this.Scope = new BoundScope(this.Scope);
        const Expression = this.Bind(Node.Expression);
        const Dependencies = new Set<string>(this.Scope.Names);
        const Data = new BoundReferenceStatement(BoundKind.ReferenceStatement, Left.Name, Expression, Dependencies);
        this.Scope = this.Scope.Parent as BoundScope;
        this.Scope.TryDeclareCell(Data);
        return Data;
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
      case SyntaxKind.HatToken:
        return BoundBinaryOperatorKind.Exponentiation;
    }
    throw this.Diagnostics.MissingOperatorKind(Kind);
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    const Right = this.Bind(Node.Right);
    switch (Node.Operator.Kind) {
      case SyntaxKind.MinusToken:
      case SyntaxKind.PlusToken:
        const Operator = this.BindUnaryOperatorKind(Node.Operator.Kind);
        return new BoundUnaryExpression(BoundKind.UnaryExpression, Operator, Right);
    }
    return Right;
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

  private BindRangeBranch<Kind extends SyntaxNode>(Node: Kind) {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        return new BoundRowReference(BoundKind.RowReference, (Node as NodeType<SyntaxToken>).Text);
      case SyntaxKind.IdentifierToken:
        return new BoundColumnReference(BoundKind.ColumnReference, (Node as NodeType<SyntaxToken>).Text);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
    }
    throw this.Diagnostics.NotARangeBranch(Node.Kind);
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.BindRangeBranch(Node.Left);
    const BoundRight = this.BindRangeBranch(Node.Right);
    return new BoundRangeReference(BoundKind.RangeReference, BoundLeft.Name + ":" + BoundRight.Name);
  }

  private BindCellReference(Node: CellReference) {
    const BoundLeft = this.BindRangeBranch(Node.Left) as IsReferable;
    const BoundRight = this.BindRangeBranch(Node.Right) as IsReferable;
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
