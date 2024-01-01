import { BoundScope } from "./BoundScope";
import { BoundBinaryExpression } from "./CodeAnalysis/Binder/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binder/BoundBinaryOperatorKind";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { BoundCellReference } from "./CodeAnalysis/Binder/BoundCellReference";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binder/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binder/BoundNumber";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { BoundUnaryExpression } from "./CodeAnalysis/Binder/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binder/BoundUnaryOperatorKind";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { EvaluationResult } from "./EvaluationResult";

export class Evaluator {
  private Result = new EvaluationResult(0, new DiagnosticBag());
  private Scope = new BoundScope();

  EvaluateNode(Node: BoundProgram) {
    this.Scope = Node.Scope;
    if (Node.Diagnostics.Any()) {
      this.Result.Diagnostics.Merge(Node.Diagnostics);
      return this.Result;
    }
    this.Evaluate(Node);
    return this.Result;
  }

  private Evaluate<Kind extends BoundNode>(Node: Kind): number {
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
      case BoundKind.CellReference:
        return this.EvaluateCellReference(Node as NodeType<BoundCellReference>);
      case BoundKind.NumericLiteral:
        return this.EvaluateNumericLiteral(Node as NodeType<BoundNumber>);
    }
    this.Result.Diagnostics.ReportMissingMethod(Node.Kind);
    return this.Result.Value;
  }

  private EvaluateProgram(Node: BoundProgram): number {
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

  private EvaluateUnaryExpression(Node: BoundUnaryExpression): number {
    const Right = this.Evaluate(Node.Right);
    switch (Node.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Right;
      case BoundUnaryOperatorKind.Negation:
        return -Right;
    }
  }

  private EvaluateNumericLiteral(Node: BoundNumber) {
    return Node.Value;
  }

  private EvaluateCellReference(Node: BoundCellReference): number {
    const Document = this.Scope.GetCell(Node.Name);
    if (Document === undefined) {
      this.Result.Diagnostics.ReportUndefinedCell(Node.Name);
      return this.Result.Value;
    }
    return Document.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    const Expression = this.Evaluate(Node.Expression);
    return Expression;
  }
}
