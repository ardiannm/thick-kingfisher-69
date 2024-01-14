import { SyntaxKind } from "../Parser/SyntaxKind";
import { SyntaxNode } from "../Parser/SyntaxNode";
import { BinaryExpression } from "../Parser/BinaryExpression";
import { CellReference } from "../Parser/CellReference";
import { SyntaxToken } from "../Parser/SyntaxToken";
import { BoundBinaryExpression } from "./BoundBinaryExpression";
import { BoundKind } from "./BoundKind";
import { BoundNumericLiteral } from "./BoundNumericLiteral";
import { BoundBinaryOperatorKind } from "./BoundBinaryOperatorKind";
import { UnaryExpression } from "../Parser/UnaryExpression";
import { BoundUnaryExpression } from "./BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "../Parser/ParenthesizedExpression";
import { BoundNode } from "./BoundNode";
import { Program } from "../Parser/Program";
import { BoundStatement } from "./BoundStatement";
import { BoundProgram } from "./BoundProgram";
import { BoundScope } from "./BoundScope";
import { CellAssignment } from "../Parser/CellAssignment";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { Cell } from "../../Cell";
import { BoundCellAssignment } from "./BoundCellAssignment";

export class Binder {
  public Scope = new BoundScope(null);
  constructor(private Diagnostics: DiagnosticBag) {}

  public Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.Program:
        return this.BindProgram(Node as NodeType<Program>);
      case SyntaxKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken<SyntaxKind.NumberToken>>);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
      case SyntaxKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.UnaryExpression:
        return this.BindUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.BinaryExpression:
        return this.BindBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.CellAssignment:
        return this.BindCellAssignment(Node as NodeType<CellAssignment>);
    }
    throw new Error(`Binder: Method for '${Node.Kind}' is not implemented`);
  }

  private BindProgram(Node: Program) {
    const Root = new Array<BoundStatement>();
    for (const Member of Node.Root) Root.push(this.Bind(Member));
    this.Scope.CheckDeclarations(this.Diagnostics);
    return new BoundProgram(BoundKind.Program, Root);
  }

  private BindCellAssignment(Node: CellAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        break;
      default:
        this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
    }
    const Cell = this.Bind(Node.Left) as Cell;
    const AssignmentScope = new BoundScope(this.Scope);
    this.Scope = AssignmentScope as BoundScope;
    Cell.Expression = this.Bind(Node.Expression);
    Cell.ClearSubjects();
    for (const Subject of this.Scope.GetCells()) {
      Cell.Watch(Subject);
    }
    this.Scope = this.Scope.ParentScope as BoundScope;
    Cell.Declared = true;
    return new BoundCellAssignment(BoundKind.CellAssignment, Cell);
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

  private BindCellReference(Node: CellReference) {
    const Name = Node.TextSpan().Get();
    return this.Scope.ConstructCell(Name);
  }

  private BindNumber(Node: SyntaxToken<SyntaxKind.NumberToken>) {
    const Value = parseFloat(Node.Text);
    return new BoundNumericLiteral(BoundKind.NumericLiteral, Value);
  }
}
