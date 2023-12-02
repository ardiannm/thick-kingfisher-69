import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundIdentifier } from "./CodeAnalysis/Binding/BoundIdentifier";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundRangeReference } from "./CodeAnalysis/Binding/BoundRangeReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { BoundSyntaxTree } from "./CodeAnalysis/Binding/BoundSyntaxTree";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";
import { Environment } from "./Environment";

export class Evaluator {
  constructor(public Env: Environment, public Logger: Diagnostics) {}

  Evaluate<Kind extends BoundNode>(Bound: Kind) {
    type BoundType<T> = Kind & T;

    switch (Bound.Kind) {
      case BoundKind.BoundSyntaxTree:
        return this.EvaluateSyntaxTree(Bound as BoundType<BoundSyntaxTree>);
      case BoundKind.BoundIdentifier:
        return this.EvaluateIdentifier(Bound as BoundType<BoundIdentifier>);
      case BoundKind.BoundNumber:
        return this.EvaluateNumber(Bound as BoundType<BoundNumber>);
      case BoundKind.BoundCellReference:
        return this.EvaluateCellReference(Bound as BoundType<BoundCellReference>);
      case BoundKind.BoundRangeReference:
        return this.EvaluateRangeReference(Bound as BoundType<BoundRangeReference>);
      case BoundKind.BoundUnaryExpression:
        return this.EvaluateUnaryExpression(Bound as BoundType<BoundUnaryExpression>);
      case BoundKind.BoundBinaryExpression:
        return this.EvaluateBinaryExpression(Bound as BoundType<BoundBinaryExpression>);
      case BoundKind.BoundReferenceAssignment:
        return this.EvaluateReferenceAssignment(Bound as BoundType<BoundReferenceAssignment>);
      default:
        this.Logger.MissingEvaluationMethod(Bound.Kind);
    }
  }

  private EvaluateReferenceAssignment(Bound: BoundReferenceAssignment) {
    const Value = this.Evaluate(Bound.Expression);
    this.Env.Assign(Bound, Value).forEach((OutDatedBound) => {
      this.Env.Set(OutDatedBound.Reference, this.Evaluate(OutDatedBound.Expression));
    });
    return Value;
  }

  private EvaluateBinaryExpression(Bound: BoundBinaryExpression) {
    const LeftValue = this.Evaluate(Bound.Left);
    const RightValue = this.Evaluate(Bound.Right);
    switch (Bound.OperatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return LeftValue + RightValue;
      case BoundBinaryOperatorKind.Subtraction:
        return LeftValue - RightValue;
      case BoundBinaryOperatorKind.Multiplication:
        return LeftValue * RightValue;
      case BoundBinaryOperatorKind.Division:
        return LeftValue / RightValue;
      default:
        this.Logger.NotAnOperator(Bound.OperatorKind);
    }
  }

  private EvaluateUnaryExpression(Bound: BoundUnaryExpression) {
    const Value = this.Evaluate(Bound.Expression);
    switch (Bound.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Value;
      case BoundUnaryOperatorKind.Negation:
        return -Value;
      default:
        this.Logger.NotAnOperator(Bound.OperatorKind);
    }
  }

  private EvaluateRangeReference(Bound: BoundRangeReference) {
    this.Logger.MissingEvaluationMethod(Bound.Kind);
  }

  private EvaluateCellReference(Bound: BoundCellReference) {
    return this.Env.Get(Bound);
  }

  private EvaluateNumber(Bound: BoundNumber) {
    return Bound.Value;
  }

  private EvaluateIdentifier(Bound: BoundIdentifier) {
    this.Logger.MissingEvaluationMethod(Bound.Kind);
  }

  private EvaluateSyntaxTree(Bound: BoundSyntaxTree) {
    let Value: number = 0;
    if (Bound.Expressions.length) {
      Bound.Expressions.forEach((BoundExpression) => (Value = this.Evaluate(BoundExpression) as number));
      return Value;
    }
    this.Logger.EmptySyntaxForEvaluator();
  }
}
