import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundUnaryExpression } from "./CodeAnalysis/Binder/BoundUnaryExpression";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { BoundCellReference } from "./CodeAnalysis/Binder/BoundCellReference";
import { CellReference } from "./CodeAnalysis/Parser/CellReference";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { DiagnosticKind } from "./CodeAnalysis/Diagnostics/DiagnosticKind";
import { BoundScope } from "./CodeAnalysis/Binder/BoundScope";
import { BoundReferenceStatement } from "./CodeAnalysis/Binder/BoundReferenceStatement";

export class Evaluator {
  private Value: number = 0;
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Evaluator);

  constructor(private Scope: BoundScope) {}

  Evaluate<Kind extends BoundNode>(Node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.Program:
        return this.EvaluateProgram(Node as NodeType<BoundProgram>);
      case BoundKind.Number:
        return this.EvaluateNumber(Node as NodeType<BoundNumber>);
      case BoundKind.CellReference:
        return this.EvaluateCellReference(Node as NodeType<CellReference>);
      case BoundKind.UnaryExpression:
        return this.EvaluateUnaryExpression(Node as NodeType<BoundUnaryExpression>);
      case BoundKind.BinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
      case BoundKind.ReferenceStatement:
        return this.EvaluateReferenceStatement(Node as NodeType<BoundReferenceStatement>);
      default:
        throw this.Diagnostics.MissingMethod(Node.Kind);
    }
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Statement of Node.Root) {
      this.Value = this.Evaluate(Statement);
    }
    return this.Value;
  }

  private EvaluateReferenceStatement(Node: BoundReferenceStatement) {
    const Value = this.Evaluate(Node.Expression);
    const Dependents = this.Scope.Assign(Node, Value);
    for (const Dep of Dependents) {
      this.Scope.SetValueForCell(Dep.Name, this.Evaluate(Dep.Expression));
    }
    return Value;
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
      case BoundBinaryOperatorKind.Exponentiation:
        return LeftValue ** RightValue;
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
    return this.Scope.TryLookUpCell(Node.Name).Value;
  }

  private EvaluateNumber(Node: BoundNumber) {
    return Node.Value;
  }
}
