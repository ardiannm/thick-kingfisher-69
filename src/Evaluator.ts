import { Cell } from "./Cell";
import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { BoundUnaryExpression } from "./CodeAnalysis/Binder/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { EvaluatedProgram } from "./EvaluatedProgram";

export class Evaluator {
  private Program = new EvaluatedProgram();

  Evaluate(Node: BoundProgram) {
    if (Node.Diagnostics.Any()) {
      this.Program.Diagnostics.Consume(Node.Diagnostics);
      return this.Program;
    }
    this.EvaluateBoundNode(Node);
    return this.Program;
  }

  EvaluateBoundNode<Kind extends BoundNode>(Node: Kind): number {
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
    this.Program.Diagnostics.ReportMissingMethod(Node.Kind);
    return this.Program.Value;
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Root of Node.Root) this.Program.Value = this.EvaluateBoundNode(Root);
    return this.Program.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    return Node.Cell.Evaluate(this);
  }

  private EvaluateCell(Node: Cell) {
    return Node.Value;
  }

  private EvaluateBinaryExpression(Node: BoundBinaryExpression): number {
    const Left = this.EvaluateBoundNode(Node.Left);
    const Right = this.EvaluateBoundNode(Node.Right);
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
    const Right = this.EvaluateBoundNode(Node.Right);
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
