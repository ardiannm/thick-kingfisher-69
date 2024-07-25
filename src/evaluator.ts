import { Cell } from "./cell";
import { BoundKind } from "./analysis/binder/kind/bound.kind";
import { BoundCompilationUnit } from "./analysis/binder/compilation.unit";
import { BoundBinaryOperatorKind } from "./analysis/binder/kind/binary.operator.kind";
import { BoundUnaryOperatorKind } from "./analysis/binder/kind/unary.operator.kind";
import { BoundBinaryExpression } from "./analysis/binder/binary.expression";
import { BoundNumericLiteral } from "./analysis/binder/numeric.literal";
import { BoundCellAssignment } from "./analysis/binder/cell.assignment";
import { BoundUnaryExpression } from "./analysis/binder/unary.expression";
import { BoundNode } from "./analysis/binder/bound.node";
import { ColorPalette } from "./dev/color.palette";
import { DiagnosticsBag } from "./analysis/diagnostics/diagnostics.bag";
import { BoundFunctionExpression } from "./analysis/binder/function.expression";

export class Evaluator {
  private value = 0;
  private evaluated = new Set<string>();
  private edges = new Set<Cell>();
  private notified = new Set<string>();
  constructor(private diagnostics: DiagnosticsBag) {}

  evaluate<Kind extends BoundNode>(node: Kind): number {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case BoundKind.CompilationUnit:
        return this.evaluateProgram(node as NodeType<BoundCompilationUnit>);
      case BoundKind.FunctionExpression:
        return this.evaluateFunctionExpression(node as NodeType<BoundFunctionExpression>);
      case BoundKind.CellAssignment:
        return this.evaluateCellAssignment(node as NodeType<BoundCellAssignment>);
      case BoundKind.BinaryExpression:
        return this.evaluateBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.UnaryExpression:
        return this.evaluateUnaryExpression(node as NodeType<BoundUnaryExpression>);
      case BoundKind.Cell:
        return this.evaluateCell(node as NodeType<Cell>);
      case BoundKind.NumericLiteral:
        return this.evaluateNumericLiteral(node as NodeType<BoundNumericLiteral>);
    }
    this.diagnostics.evaluatorMethod(node.kind);
    return 0;
  }

  private evaluateFunctionExpression(node: BoundFunctionExpression): number {
    return this.value;
  }

  private evaluateProgram(node: BoundCompilationUnit): number {
    for (const statement of node.statements) this.value = this.evaluate(statement);
    return this.value;
  }

  private evaluateCellAssignment(node: BoundCellAssignment): number {
    const value = this.evaluate(node.cell.expression);
    if (node.cell.value !== value) {
      node.cell.value = value;
      this.edges.clear();
      this.notified.clear();
      node.cell.subscribers.forEach((sub) => this.notifyForChange(sub));
      this.edges.forEach((edge) => this.evaluateCell(edge));
    }
    return node.cell.value;
  }

  private notifyForChange(node: Cell) {
    this.notified.add(node.name);
    this.evaluated.delete(node.name);
    if (node.subscribers.size) node.subscribers.forEach((sub) => !this.notified.has(sub.name) && this.notifyForChange(sub));
    else this.edges.add(node);
  }

  private evaluateCell(node: Cell) {
    if (this.evaluated.has(node.name)) {
      console.log(ColorPalette.terracotta(`cached value ${node.name} -> ${node.value}`));
      return node.value;
    }
    node.value = this.evaluate(node.expression);
    this.evaluated.add(node.name);
    console.log(ColorPalette.teal(`evaluated value ${node.name} -> ${node.value}`));
    return node.value;
  }

  private evaluateBinaryExpression(node: BoundBinaryExpression): number {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
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

  private evaluateUnaryExpression(node: BoundUnaryExpression): number {
    const right = this.evaluate(node.right);
    switch (node.operatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return right;
      case BoundUnaryOperatorKind.Negation:
        return -right;
    }
  }

  private evaluateNumericLiteral(node: BoundNumericLiteral) {
    return node.value;
  }
}
