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
import { EvaluatedProgram } from "./EvaluatedProgram";

export class Evaluator {
  private Scope = new BoundScope();
  private Program = new EvaluatedProgram();

  Evaluate(Node: BoundProgram) {
    this.Scope = Node.Scope;
    if (Node.Diagnostics.Any()) {
      this.Program.Diagnostics.Merge(Node.Diagnostics);
      return this.Program;
    }
    this.EvaluateBound(Node);
    return this.Program;
  }

  private EvaluateBound<Kind extends BoundNode>(Node: Kind): number {
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
    this.Program.Diagnostics.ReportMissingMethod(Node.Kind);
    return this.Program.Value;
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Root of Node.Root) this.Program.Value = this.EvaluateBound(Root);
    return this.Program.Value;
  }

  private EvaluateBinaryExpression(Node: BoundBinaryExpression): number {
    const Left = this.EvaluateBound(Node.Left);
    const Right = this.EvaluateBound(Node.Right);
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
    const Right = this.EvaluateBound(Node.Right);
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
    const Document = this.Scope.AssertGetCell(Node.Name);
    if (Document) return Document.Value;
    this.Program.Diagnostics.ReportUndefinedCell(Node.Name);
    return this.Program.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    const Value = this.EvaluateBound(Node.Expression);
    this.Scope.SetValueForCell(Node, Value);
    return Value;
  }
}
