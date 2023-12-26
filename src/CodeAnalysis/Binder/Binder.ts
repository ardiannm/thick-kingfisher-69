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
import { Environment } from "../../Environment";
import { BoundDeclarationStatement } from "./BoundDeclarationStatement";
import { BoundRowReference } from "./BoundRowReference";
import { BoundColumnReference } from "./BoundColumnReference";
import { IsReferable } from "./IsReferable";

export class Binder {
  constructor(private Env: Environment) {}

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
      case SyntaxKind.CloneCell:
        return this.BindCloneCell(Node as NodeType<DeclarationStatement>);
    }
    throw this.Env.Diagnostics.ReportMissingMethod(Node.Kind);
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
          this.Env.Diagnostics.ReportGloballyNotAllowed(Member.Kind);
      }
    }
    return new BoundProgram(BoundKind.Program, Root, this.Env.Diagnostics);
  }

  private BindCloneCell(Node: DeclarationStatement) {
    if (Node.Left.Kind !== SyntaxKind.CellReference || Node.Expression.Kind !== SyntaxKind.CellReference) {
      this.Env.Diagnostics.ReportCantCopy(Node.Left.Kind, Node.Expression.Kind);
    }
    const Left = this.Bind(Node.Left) as BoundCellReference;
    const Right = this.Bind(Node.Expression) as BoundCellReference;
    const Cell = this.Env.GetCell(Right.Name);
    const Data = new BoundDeclarationStatement(BoundKind.CloneCell, Left.Name, Cell.Expression, Cell.Dependencies);
    this.Env.DeclareCell(Data);
    return Data;
  }

  private BindReferenceCell(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        this.Env = new Environment(this.Env);
        const Expression = this.Bind(Node.Expression);
        const Dependencies = new Set<string>(this.Env.Names);
        const Data = new BoundDeclarationStatement(BoundKind.ReferenceCell, Left.Name, Expression, Dependencies);
        this.Env = this.Env.ParentEnv as Environment;
        this.Env.DeclareCell(Data);
        return Data;
    }
    throw this.Env.Diagnostics.CantUseAsAReference(Node.Left.Kind);
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
    throw this.Env.Diagnostics.ReportMissingOperatorKind(Kind);
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
    throw this.Env.Diagnostics.ReportMissingOperatorKind(Kind);
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
    throw this.Env.Diagnostics.ReportNotARangeMember(Node.Kind);
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
    this.Env.PushCell(Name);
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
