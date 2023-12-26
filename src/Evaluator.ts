import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundUnaryExpression } from "./CodeAnalysis/Binder/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { BoundCellReference } from "./CodeAnalysis/Binder/BoundCellReference";
import { CellReference } from "./CodeAnalysis/Parser/CellReference";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { Environment } from "./Environment";
import { BoundDeclarationStatement } from "./CodeAnalysis/Binder/BoundDeclarationStatement";
import { DiagnosticBag } from "./DiagnosticBag";
import { DiagnosticPhase } from "./DiagnosticPhase";

export class Evaluator {
  private Value: number = 0;
  constructor(private Env: Environment, private Diagnostics: DiagnosticBag) {
    this.Diagnostics.Phase = DiagnosticPhase.Evaluator;
  }

  public Evaluate<Kind extends BoundNode>(Node: Kind): number {
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
      case BoundKind.ReferenceCell:
      case BoundKind.CloneCell:
        return this.EvaluateDeclaration(Node as NodeType<BoundDeclarationStatement>);
      default:
        this.Diagnostics.ReportMissingMethod(Node.Kind);
        return 0;
    }
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Statement of Node.Root) {
      this.Value = this.Evaluate(Statement);
    }
    return this.Value;
  }

  private EvaluateDeclaration(Node: BoundDeclarationStatement) {
    const Value = this.Evaluate(Node.Expression);
    const Dependents = this.Env.Assign(Node, Value);
    for (const Dep of Dependents) {
      this.Env.SetValueForCell(Dep.Name, this.Evaluate(Dep.Expression));
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
          this.Diagnostics.ReportCantDivideByZero();
          return 0;
        }
        return LeftValue / RightValue;
      case BoundBinaryOperatorKind.Exponentiation:
        return LeftValue ** RightValue;
      default:
        this.Diagnostics.ReportMissingOperatorKind(Node.OperatorKind);
    }
    return 0;
  }

  private EvaluateUnaryExpression(Node: BoundUnaryExpression) {
    const Value = this.Evaluate(Node.Expression);
    switch (Node.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Value;
      case BoundUnaryOperatorKind.Negation:
        return -Value;
      default:
        this.Diagnostics.ReportMissingOperatorKind(Node.OperatorKind);
    }
    return 0;
  }

  private EvaluateCellReference(Node: BoundCellReference): number {
    return this.Env.GetCell(Node.Name).Value;
  }

  private EvaluateNumber(Node: BoundNumber) {
    return Node.Value;
  }
}
