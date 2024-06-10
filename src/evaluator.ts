import { Cell } from "./cell";
import { BoundKind } from "./analysis/binder/kind/bound.kind";
import { BoundProgram } from "./analysis/binder/program";
import { BoundBinaryOperatorKind } from "./analysis/binder/kind/binary.operator.kind";
import { BoundUnaryOperatorKind } from "./analysis/binder/kind/unary.operator.kind";
import { BoundBinaryExpression } from "./analysis/binder/binary.expression";
import { BoundNumericLiteral } from "./analysis/binder/numeric.literal";
import { BoundCellAssignment } from "./analysis/binder/cell.assignment";
import { BoundUnaryExpression } from "./analysis/binder/unary.expression";
import { BoundNode } from "./analysis/binder/bound.node";
import { ColorPalette } from "./dev/color.palette";
import { DiagnosticBag } from "./analysis/diagnostics/diagnostic.bag";
import { BoundFunctionExpression } from "./analysis/binder/function.expression";

export class Evaluator {
  private value = 0;
  private evaluated = new Set<string>();
  private edges = new Set<Cell>();
  private notified = new Set<string>();
  constructor(private diagnostics: DiagnosticBag) {}

  Evaluate<Kind extends BoundNode>(node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case BoundKind.Program:
        return this.EvaluateProgram(node as NodeType<BoundProgram>);
      case BoundKind.FunctionExpression:
        return this.EvaluateFunctionExpression(node as NodeType<BoundFunctionExpression>);
      case BoundKind.CellAssignment:
        return this.EvaluateCellAssignment(node as NodeType<BoundCellAssignment>);
      case BoundKind.BinaryExpression:
        return this.EvaluateBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.UnaryExpression:
        return this.EvaluateUnaryExpression(node as NodeType<BoundUnaryExpression>);
      case BoundKind.Cell:
        return this.EvaluateCell(node as NodeType<Cell>);
      case BoundKind.NumericLiteral:
        return this.EvaluateNumericLiteral(node as NodeType<BoundNumericLiteral>);
    }
    this.diagnostics.EvaluatorMethod(node.kind);
    return 0;
  }

  private EvaluateFunctionExpression(node: BoundFunctionExpression): number {
    return this.value;
  }

  private EvaluateProgram(node: BoundProgram): number {
    for (const statement of node.statements) this.value = this.Evaluate(statement);
    return this.value;
  }

  private EvaluateCellAssignment(node: BoundCellAssignment): number {
    const value = this.Evaluate(node.cell.expression);
    if (node.cell.value !== value) {
      node.cell.value = value;
      this.edges.clear();
      this.notified.clear();
      node.cell.subscribers.forEach((sub) => this.NotifyForChange(sub));
      this.edges.forEach((edge) => this.EvaluateCell(edge));
    }
    return node.cell.value;
  }

  private NotifyForChange(node: Cell) {
    this.notified.add(node.name);
    this.evaluated.delete(node.name);
    if (node.subscribers.size) node.subscribers.forEach((sub) => !this.notified.has(sub.name) && this.NotifyForChange(sub));
    else this.edges.add(node);
  }

  private EvaluateCell(node: Cell) {
    if (this.evaluated.has(node.name)) {
      console.log(ColorPalette.Terracotta(`cached value ${node.name} -> ${node.value}`));
      return node.value;
    }
    node.value = this.Evaluate(node.expression);
    this.evaluated.add(node.name);
    console.log(ColorPalette.Teal(`evaluated value ${node.name} -> ${node.value}`));
    return node.value;
  }

  private EvaluateBinaryExpression(node: BoundBinaryExpression): number {
    const left = this.Evaluate(node.left);
    const right = this.Evaluate(node.right);
    switch (node.operatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return left + right;
      case BoundBinaryOperatorKind.Subtraction:
        return left - right;
      case BoundBinaryOperatorKind.Multiplication:
        return left * right;
      case BoundBinaryOperatorKind.Division:
        return left / right;
      case BoundBinaryOperatorKind.Exponentiation:
        return left ** right;
    }
  }

  private EvaluateUnaryExpression(node: BoundUnaryExpression): number {
    const right = this.Evaluate(node.right);
    switch (node.operatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return right;
      case BoundUnaryOperatorKind.Negation:
        return -right;
    }
  }

  private EvaluateNumericLiteral(node: BoundNumericLiteral) {
    return node.value;
  }
}
