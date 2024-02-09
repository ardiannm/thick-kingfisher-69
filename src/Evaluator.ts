import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/Kind/BoundBinaryOperatorKind";
import { BoundCellAssignment } from "./CodeAnalysis/Binding/BoundCellAssignment";
import { BoundKind } from "./CodeAnalysis/Binding/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumericLiteral } from "./CodeAnalysis/Binding/BoundNumericLiteral";
import { BoundProgram } from "./CodeAnalysis/Binding/BoundProgram";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/Kind/BoundUnaryOperatorKind";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { Cell } from "./Cell";
import { ColorPalette } from "./View/ColorPalette";
import { CompilerOptions } from "./CompilerOptions";

export class Evaluator {
  private Value = 0;
  private static Stack = new Set<string>();
  private Processing = "";
  constructor(private Diagnostics: DiagnosticBag, private Options: CompilerOptions) {}

  Evaluate<Kind extends BoundNode>(Node: Kind): number {
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
    this.Diagnostics.EvaluatorMethod(Node.Kind);
    return 0;
  }

  private EvaluateProgram(Node: BoundProgram): number {
    for (const Root of Node.Root) this.Value = this.Evaluate(Root);
    return this.Value;
  }

  private EvaluateCellAssignment(Node: BoundCellAssignment): number {
    console.log();
    this.Processing = Node.Cell.Name;
    this.ComputeCell(Node.Cell);
    return Node.Cell.Value;
  }

  private ComputeCell(Node: Cell) {
    Evaluator.Stack.delete(Node.Name);
    if (Node.Observers.size) {
      Node.Observers.forEach((o) => this.ComputeCell(o));
    } else {
      this.EvaluateCell(Node);
    }
    return Node.Value;
  }

  private EvaluateCell(Node: Cell) {
    if (Evaluator.Stack.has(Node.Name)) {
      if (this.Options.DevMode) console.log(ColorPalette.Turquoise(this.Processing + " -> already done " + Node.Name + " to " + Node.Value));
      return Node.Value;
    }
    Node.Value = this.Evaluate(Node.Expression);
    Evaluator.Stack.add(Node.Name);
    if (this.Options.DevMode) console.log(ColorPalette.Lavender(this.Processing + " -> computing " + Node.Name + " to " + Node.Value));
    return Node.Value;
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

  private EvaluateNumericLiteral(Node: BoundNumericLiteral) {
    return Node.Value;
  }
}
