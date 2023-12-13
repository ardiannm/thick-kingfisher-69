import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { CellReference } from "./CodeAnalysis/Syntax/CellReference";
import { Environment } from "./Environment";
import { BoundProgram } from "./CodeAnalysis/Binding/BoundProgram";

export class Evaluator {
  private Diagnostics = new DiagnosticBag();
  private Value: number = 0;

  constructor(private Env: Environment) {}

  Evaluate<Kind extends BoundNode>(Node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.BoundProgram:
        return this.EvaluateProgram(Node as NodeType<BoundProgram>);
      case BoundKind.BoundNumber:
        return this.EvaluateNumber(Node as NodeType<BoundNumber>);
      case BoundKind.BoundCellReference:
        return this.EvaluateCellReference(Node as NodeType<CellReference>);
      case BoundKind.BoundUnaryExpression:
        return this.EvaluateUnaryExpression(Node as NodeType<BoundUnaryExpression>);
      case BoundKind.BoundBinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
      default:
        throw this.Diagnostics.MissingEvaluationMethod(Node.Kind);
    }
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Statement of Node.Root) {
      this.Value = this.Evaluate(Statement);
    }
    return this.Value;
  }

  private EvaluateBinaryExpression(Node: BoundBinaryExpression) {
    const LeftValue = this.Evaluate(Node.Left);
    const RightValue = this.Evaluate(Node.Right);
    switch (Node.OperatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return LeftValue + RightValue;
      case BoundBinaryOperatorKind.Subtraction:
        return LeftValue - RightValue;
      case BoundBinaryOperatorKind.Multiplication:
        return LeftValue * RightValue;
      case BoundBinaryOperatorKind.Division:
        if (RightValue === 0) {
          throw this.Diagnostics.CantDivideByZero();
        }
        return LeftValue / RightValue;
      default:
        throw this.Diagnostics.MissingOperatorKind(Node.OperatorKind);
    }
  }

  private EvaluateUnaryExpression(Node: BoundUnaryExpression) {
    const Value = this.Evaluate(Node.Expression);
    switch (Node.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Value;
      case BoundUnaryOperatorKind.Negation:
        return -Value;
      default:
        throw this.Diagnostics.MissingOperatorKind(Node.OperatorKind);
    }
  }

  private EvaluateCellReference(Node: BoundCellReference): number {
    return this.Env.GetValue(Node.Name);
  }

  private EvaluateNumber(Node: BoundNumber) {
    return Node.Value;
  }
}
