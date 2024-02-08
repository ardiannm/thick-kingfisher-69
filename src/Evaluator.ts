import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/Kind/BoundBinaryOperatorKind";
import { BoundCellAssignment } from "./CodeAnalysis/Binding/BoundCellAssignment";
import { BoundKind } from "./CodeAnalysis/Binding/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binding/BoundNumericLiteral";
import { BoundProgram } from "./CodeAnalysis/Binding/BoundProgram";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/Kind/BoundUnaryOperatorKind";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { Cell } from "./Cell";

export class Evaluator {
  private Value = 0;
  constructor(private Diagnostics: DiagnosticBag) {}

  Evaluate<Kind extends BoundNode>(Node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.Program:
        return this.EvaluateProgram(Node as NodeType<BoundProgram>);
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

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Root of Node.Root) this.Value = this.Evaluate(Root);
    return this.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    Node.Cell.Evaluated = false;
    return this.Evaluate(Node.Cell);
  }

  private EvaluateCell(Node: Cell) {
    if (Node.Evaluated) {
      return Node.Value;
    }
    Node.Value = this.Evaluate(Node.Expression);
    Node.Evaluated = true;
    for (const Observer of Node.Observers.values()) {
      Observer.Evaluated = false;
      this.EvaluateCell(Observer);
    }
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
