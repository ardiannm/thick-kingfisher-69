import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { EvaluationResult } from "./EvaluationResult";

export class Evaluator {
  private Result = new EvaluationResult(0, new DiagnosticBag());

  EvalauteProgram(Node: BoundProgram) {
    if (Node.Diagnostics.Any()) {
      this.Result.Diagnostics.Merge(Node.Diagnostics);
      return this.Result;
    }
    this.Evaluate(Node);
    return this.Result;
  }

  private Evaluate<Kind extends BoundNode>(Node: Kind) {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.Program:
        return this.EvaluateProgram(Node as NodeType<BoundProgram>);
      case BoundKind.BinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
    }
    this.Result.Diagnostics.ReportMissingMethod(Node.Kind);
    return this.Result.Value;
  }

  private EvaluateProgram(Node: BoundProgram) {
    for (const Root of Node.Root) this.Result.Value = this.Evaluate(Root);
    return this.Result.Value;
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
}
