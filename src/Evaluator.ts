import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundReferenceDeclaration } from "./CodeAnalysis/Binding/BoundReferenceDeclaration";
import { BoundSyntaxTree } from "./CodeAnalysis/Binding/BoundSyntaxTree";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { DiagnosticBag } from "./CodeAnalysis/ErrorHandling/DiagnosticBag";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";
import { Environment } from "./Environment";

// Evaluator class responsible for evaluating bound syntax nodes.

export class Evaluator {
  // Logger for reporting diagnostics and errors during evaluation.
  private Logger = new DiagnosticBag();
  // Environment to manage state and change observations.
  private Env = new Environment();

  // Evaluate method takes a BoundNode and returns the computed result.
  Evaluate<Kind extends BoundNode>(Node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case BoundKind.BoundSyntaxTree:
        return this.EvaluateSyntaxTree(Node as NodeType<BoundSyntaxTree>);
      case BoundKind.BoundNumber:
        return this.EvaluateNumber(Node as NodeType<BoundNumber>);
      case BoundKind.BoundCellReference:
        return this.EvaluateCellReference(Node as NodeType<BoundCellReference>);
      case BoundKind.BoundUnaryExpression:
        return this.EvaluateUnaryExpression(Node as NodeType<BoundUnaryExpression>);
      case BoundKind.BoundBinaryExpression:
        return this.EvaluateBinaryExpression(Node as NodeType<BoundBinaryExpression>);
      case BoundKind.BoundReferenceDeclaration:
        return this.EvaluateReferenceDeclaration(Node as NodeType<BoundReferenceDeclaration>);
      default:
        throw this.Logger.MissingEvaluationMethod(Node.Kind);
    }
  }

  // Evaluation method for BoundReferenceAssignment syntax node.
  private EvaluateReferenceDeclaration(Node: BoundReferenceDeclaration) {
    const Value = this.Evaluate(Node.Expression);
    // Update the environment with the new value and trigger change observations.
    for (const OutDatedNode of this.Env.Assign(Node, Value)) {
      this.Env.SetValue(OutDatedNode, this.Evaluate(OutDatedNode.Expression));
    }
    return Value;
  }

  // Evaluation method for BoundBinaryExpression syntax node.
  private EvaluateBinaryExpression(Node: BoundBinaryExpression) {
    const LeftValue = this.Evaluate(Node.Left);
    const RightValue = this.Evaluate(Node.Right);
    // Perform binary operation based on the operator kind.
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
        throw this.Logger.MissingOperatorKind(Node.OperatorKind);
    }
  }

  // Evaluation method for BoundUnaryExpression syntax node.
  private EvaluateUnaryExpression(Node: BoundUnaryExpression) {
    const Value = this.Evaluate(Node.Expression);
    // Perform unary operation based on the operator kind.
    switch (Node.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Value;
      case BoundUnaryOperatorKind.Negation:
        return -Value;
      default:
        throw this.Logger.MissingOperatorKind(Node.OperatorKind);
    }
  }

  // Evaluation method for BoundCellReference syntax node.
  private EvaluateCellReference(Node: BoundCellReference) {
    return this.Env.GetValue(Node);
  }

  // Evaluation method for BoundNumber syntax node.
  private EvaluateNumber(Node: BoundNumber) {
    return Node.Value;
  }

  // Evaluation method for BoundSyntaxTree syntax node.
  private EvaluateSyntaxTree(Node: BoundSyntaxTree) {
    let Value: number = 0;
    // Evaluate each expression in the syntax tree.
    if (Node.Expressions.length) {
      Node.Expressions.forEach((BoundExpression) => (Value = this.Evaluate(BoundExpression) as number));
      return Value;
    }
    throw this.Logger.EmptySyntaxForEvaluator();
  }
}
