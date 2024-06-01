import { Cell } from "./cell";
import { BoundKind } from "./analysis/binder/kind/bound.kind";
import { BoundProgram } from "./analysis/binder/program";
import { BoundBinaryOperatorKind } from "./analysis/binder/kind/binary.operator.kind";
import { BoundUnaryOperatorKind } from "./analysis/binder/kind/unary.operator.kind";
import { BoundBinaryExpression } from "./analysis/binder/binary.expression";
import { BoundNumericLiteral } from "./analysis/binder/numeric.literal";
import { BoundCellAssignment } from "./analysis/binder/cell.assignment";
import { BoundUnaryExpression } from "./analysis/binder/unary.expression";
import { BoundNode } from "./analysis/binder/bound.node";
import { ColorPalette } from "./dev/color.palette";
import { DiagnosticBag } from "./analysis/diagnostics/diagnostic.bag";
import { BoundFunctionExpression } from "./analysis/binder/function.expression";

export class Evaluator {
  private Value = 0;
  private Evaluated = new Set<string>();
  private Edges = new Set<Cell>();
  private Notified = new Set<string>();
  constructor(private Diagnostics: DiagnosticBag) {}

  Evaluate<Kind extends BoundNode>(Node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.Program:
        return this.EvaluateProgram(Node as NodeType<BoundProgram>);
      case BoundKind.FunctionExpression:
        return this.EvaluateFunctionExpression(Node as NodeType<BoundFunctionExpression>);
      case BoundKind.CellAssignment:
        return this.EvaluateCellAssignment(Node as NodeType<BoundCellAssignment>);
      case BoundKind.BinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
      case BoundKind.UnaryExpression:
        return this.EvaluateUnaryExpression(Node as NodeType<BoundUnaryExpression>);
      case BoundKind.Cell:
        return this.EvaluateCell(Node as NodeType<Cell>);
      case BoundKind.NumericLiteral:
        return this.EvaluateNumericLiteral(Node as NodeType<BoundNumericLiteral>);
    }
    this.Diagnostics.EvaluatorMethod(Node.Kind);
    return 0;
  }

  private EvaluateFunctionExpression(Node: BoundFunctionExpression): number {
    return this.Value;
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Statement of Node.Statements) this.Value = this.Evaluate(Statement);
    return this.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    const Value = this.Evaluate(Node.Cell.Expression);
    if (Node.Cell.Value !== Value) {
      Node.Cell.Value = Value;
      this.Edges.clear();
      this.Notified.clear();
      Node.Cell.Subscribers.forEach((Sub) => this.NotifyForChange(Sub));
      this.Edges.forEach((Edge) => this.EvaluateCell(Edge));
    }
    return Node.Cell.Value;
  }

  private NotifyForChange(Node: Cell) {
    this.Notified.add(Node.Name);
    this.Evaluated.delete(Node.Name);
    if (Node.Subscribers.size) Node.Subscribers.forEach((Sub) => !this.Notified.has(Sub.Name) && this.NotifyForChange(Sub));
    else this.Edges.add(Node);
  }

  private EvaluateCell(Node: Cell) {
    if (this.Evaluated.has(Node.Name)) {
      console.log(ColorPalette.Terracotta(`cached value ${Node.Name} -> ${Node.Value}`));
      return Node.Value;
    }
    Node.Value = this.Evaluate(Node.Expression);
    this.Evaluated.add(Node.Name);
    console.log(ColorPalette.Teal(`evaluated value ${Node.Name} -> ${Node.Value}`));
    return Node.Value;
  }

  private EvaluateBinaryExpression(Node: BoundBinaryExpression): number {
    const Left = this.Evaluate(Node.Left);
    const Right = this.Evaluate(Node.Right);
    switch (Node.OperatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return Left + Right;
      case BoundBinaryOperatorKind.Subtraction:
        return Left - Right;
      case BoundBinaryOperatorKind.Multiplication:
        return Left * Right;
      case BoundBinaryOperatorKind.Division:
        return Left / Right;
      case BoundBinaryOperatorKind.Exponentiation:
        return Left ** Right;
    }
  }

  private EvaluateUnaryExpression(Node: BoundUnaryExpression): number {
    const Right = this.Evaluate(Node.Right);
    switch (Node.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Right;
      case BoundUnaryOperatorKind.Negation:
        return -Right;
    }
  }

  private EvaluateNumericLiteral(Node: BoundNumericLiteral) {
    return Node.Value;
  }
}
