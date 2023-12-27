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
import { BoundScope } from "../../BoundScope";
import { BoundDeclarationStatement } from "./BoundDeclarationStatement";
import { BoundRowReference } from "./BoundRowReference";
import { BoundColumnReference } from "./BoundColumnReference";
import { IsReferable } from "./IsReferable";
import { DiagnosticBag } from "../../DiagnosticBag";
import { DiagnosticPhase } from "../../DiagnosticPhase";

export class Binder {
  constructor(private Scope: BoundScope) {}
  public readonly Diagnostics = new DiagnosticBag();

  public Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.Program:
        return this.BindProgram(Node as NodeType<Program>);
      case SyntaxKind.IdentifierToken:
        return this.BindIdentifier(Node as NodeType<SyntaxToken<SyntaxKind.IdentifierToken>>);
      case SyntaxKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken<SyntaxKind.NumberToken>>);
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
      case SyntaxKind.ReferenceCell:
        return this.BindReferenceCell(Node as NodeType<DeclarationStatement>);
    }
    throw this.Diagnostics.ReportMissingMethod(DiagnosticPhase.Binder, Node.Kind);
  }

  private BindProgram(Node: Program) {
    const Root = new Array<BoundStatement>();
    for (const Member of Node.Root) {
      switch (Member.Kind) {
        case SyntaxKind.NumberToken:
        case SyntaxKind.CellReference:
        case SyntaxKind.ParenthesizedExpression:
        case SyntaxKind.UnaryExpression:
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.ReferenceCell:
        case SyntaxKind.CloneCell:
          Root.push(this.Bind(Member));
          continue;
        default:
          this.Diagnostics.ReportGloballyNotAllowed(DiagnosticPhase.Binder, Member.Kind);
      }
    }
    return new BoundProgram(BoundKind.Program, Root, this.Diagnostics);
  }

  private BindReferenceCell(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        break;
      default:
        this.Diagnostics.CantUseAsAReference(DiagnosticPhase.Binder, Node.Left.Kind);
    }
    const Left = this.Bind(Node.Left) as BoundCellReference;
    this.Scope = new BoundScope(this.Scope);
    const Expression = this.Bind(Node.Expression);
    const Dependencies = new Set<string>(this.Scope.Names);
    this.Scope = this.Scope.ParentEnv as BoundScope;
    if (Dependencies.has(Left.Name)) {
      this.Diagnostics.ReportUsedBeforeItsDeclaration(DiagnosticPhase.Binder, Left.Name);
    }
    for (const Dep of Dependencies) {
      if (this.Scope.DoesNotHave(Dep)) this.Diagnostics.ReportUndefinedCell(DiagnosticPhase.Binder, Dep);
    }
    const ThisNode = this.Scope.CreateCell(Left.Name, Expression, Dependencies);
    const NextNode = this.Scope.HasCircularLogic(ThisNode);
    if (NextNode) {
      this.Diagnostics.ReportCircularDependency(DiagnosticPhase.Binder, ThisNode.Name, NextNode.Name);
    }
    return new BoundDeclarationStatement(BoundKind.ReferenceCell, Left.Name, Expression, Dependencies);
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
    throw this.Diagnostics.ReportMissingOperatorKind(DiagnosticPhase.Binder, Kind);
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
    throw this.Diagnostics.ReportMissingOperatorKind(DiagnosticPhase.Binder, Kind);
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  private BindRangeBranch<Kind extends SyntaxNode>(Node: Kind) {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        const Row = Node as NodeType<SyntaxToken<SyntaxKind.NumberToken>>;
        return new BoundRowReference(BoundKind.RowReference, Row.Text);
      case SyntaxKind.IdentifierToken:
        const Column = Node as NodeType<SyntaxToken<SyntaxKind.IdentifierToken>>;
        return new BoundColumnReference(BoundKind.ColumnReference, Column.Text);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
    }
    throw this.Diagnostics.ReportNotARangeMember(DiagnosticPhase.Binder, Node.Kind);
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

  private BindIdentifier(Node: SyntaxToken<SyntaxKind.IdentifierToken>) {
    return new BoundIdentifier(BoundKind.Identifier, Node.Text);
  }

  private BindNumber(Node: SyntaxToken<SyntaxKind.NumberToken>) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.Number, Value);
  }
}
