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

  Evaluate<Kind extends BoundNode>(Node: Kind) {
    type NodeType<T> = Kind & T;

    switch (Node.Kind) {
      case BoundKind.BoundSyntaxTree:
        return this.EvaluateSyntaxTree(Node as NodeType<BoundSyntaxTree>);
      case BoundKind.BoundIdentifier:
        return this.EvaluateIdentifier(Node as NodeType<BoundIdentifier>);
      case BoundKind.BoundNumber:
        return this.EvaluateNumber(Node as NodeType<BoundNumber>);
      case BoundKind.BoundCellReference:
        return this.EvaluateCellReference(Node as NodeType<BoundCellReference>);
      case BoundKind.BoundRangeReference:
        return this.EvaluateRangeReference(Node as NodeType<BoundRangeReference>);
      case BoundKind.BoundUnaryExpression:
        return this.EvaluateUnaryExpression(Node as NodeType<BoundUnaryExpression>);
      case BoundKind.BoundBinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
      case BoundKind.BoundReferenceAssignment:
        return this.EvaluateReferenceAssignment(Node as NodeType<BoundReferenceAssignment>);
      default:
        this.Logger.MissingEvaluationMethod(Node.Kind);
    }
  }

  private EvaluateReferenceAssignment(Node: BoundReferenceAssignment) {
    const Value = this.Evaluate(Node.Expression);
    for (const OutDatedNode of this.Env.Assign(Node, Value)) {
      this.Env.SetValue(OutDatedNode, this.Evaluate(OutDatedNode.Expression));
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
        return LeftValue / RightValue;
      default:
        this.Logger.NotAnOperator(Node.OperatorKind);
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
        this.Logger.NotAnOperator(Node.OperatorKind);
    }
  }

  private EvaluateRangeReference(Node: BoundRangeReference) {
    this.Logger.MissingEvaluationMethod(Node.Kind);
  }

  private EvaluateCellReference(Node: BoundCellReference) {
    return this.Env.GetValue(Node);
  }

  private EvaluateNumber(Node: BoundNumber) {
    return Node.Value;
  }

  private EvaluateIdentifier(Node: BoundIdentifier) {
    this.Logger.MissingEvaluationMethod(Node.Kind);
  }

  private EvaluateSyntaxTree(Node: BoundSyntaxTree) {
    let Value: number = 0;
    if (Node.Expressions.length) {
      Node.Expressions.forEach((BoundExpression) => (Value = this.Evaluate(BoundExpression) as number));
      return Value;
    }
    this.Logger.EmptySyntaxForEvaluator();
  }
}
