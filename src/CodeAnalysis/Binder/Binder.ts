import { SyntaxNodeKind } from "../Parser/Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "../Parser/Kind/BinaryOperatorKind";
import { UnaryOperatorKind } from "../Parser/Kind/UnaryOperatorKind";
import { SyntaxNode } from "../Parser/SyntaxNode";
import { BinaryExpression } from "../Parser/BinaryExpression";
import { CellReference } from "../Parser/CellReference";
import { SyntaxToken } from "../Parser/SyntaxToken";
import { BoundBinaryExpression } from "./BoundBinaryExpression";
import { BoundKind } from "./Kind/BoundKind";
import { BoundNumericLiteral } from "./BoundNumericLiteral";
import { BoundBinaryOperatorKind } from "./Kind/BoundBinaryOperatorKind";
import { UnaryExpression } from "../Parser/UnaryExpression";
import { BoundUnaryExpression } from "./BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./Kind/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "../Parser/ParenthesizedExpression";
import { BoundNode } from "./BoundNode";
import { BoundError } from "./BoundError";
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
      case SyntaxNodeKind.Program:
        return this.BindProgram(Node as NodeType<Program>);
      case SyntaxNodeKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
      case SyntaxNodeKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxNodeKind.UnaryExpression:
        return this.BindUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.BindBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxNodeKind.CellAssignment:
        return this.BindCellAssignment(Node as NodeType<CellAssignment>);
    }
    this.Diagnostics.BinderMethod(Node.Kind);
    return new BoundError(BoundKind.Error);
  }

  private BindProgram(Node: Program) {
    const Root = new Array<BoundStatement>();
    for (const Member of Node.Root) Root.push(this.Bind(Member));
    this.Scope.CheckDeclarations(this.Diagnostics);
    return new BoundProgram(BoundKind.Program, Root);
  }

  private BindCellAssignment(Node: CellAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxNodeKind.CellReference:
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
        Cell.Formula = Node.Expression.TextSpan().Get();
        return new BoundCellAssignment(BoundKind.CellAssignment, Cell);
    }
    this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
    return new BoundNode(BoundKind.CellAssignment);
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindBinaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BinaryExpression, Left, Operator, Right);
  }

  private BindBinaryOperatorKind(Kind: BinaryOperatorKind): BoundBinaryOperatorKind {
    switch (Kind) {
      case BinaryOperatorKind.PlusToken:
        return BoundBinaryOperatorKind.Addition;
      case BinaryOperatorKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction;
      case BinaryOperatorKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication;
      case BinaryOperatorKind.SlashToken:
        return BoundBinaryOperatorKind.Division;
      case BinaryOperatorKind.HatToken:
        return BoundBinaryOperatorKind.Exponentiation;
    }
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    const Right = this.Bind(Node.Right);
    switch (Node.Operator.Kind) {
      case UnaryOperatorKind.MinusToken:
      case UnaryOperatorKind.PlusToken:
        const Operator = this.BindUnaryOperatorKind(Node.Operator.Kind);
        return new BoundUnaryExpression(BoundKind.UnaryExpression, Operator, Right);
    }
  }

  private BindUnaryOperatorKind(Kind: UnaryOperatorKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case UnaryOperatorKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case UnaryOperatorKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  private BindCellReference(Node: CellReference) {
    const Name = Node.TextSpan().Get();
    return this.Scope.ConstructCell(Name);
  }

  private BindNumber(Node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const Value = parseFloat(Node.Text);
    return new BoundNumericLiteral(BoundKind.NumericLiteral, Value);
  }
}
