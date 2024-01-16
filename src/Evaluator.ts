import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/Kind/BoundBinaryOperatorKind";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { BoundKind } from "./CodeAnalysis/Binder/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { BoundUnaryExpression } from "./CodeAnalysis/Binder/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/Kind/BoundUnaryOperatorKind";
import { Cell } from "./Cell";
import { Painter } from "./Text/Painter";

export class Evaluator {
  private Value = 0;

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
    throw new Error(`Evaluator: Method for '${Node.Kind}' is not implemented`);
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Root of Node.Root) this.Value = this.Evaluate(Root);
    return this.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    return Node.Cell.Evaluate(this);
  }

  private EvaluateCell(Node: Cell) {
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
