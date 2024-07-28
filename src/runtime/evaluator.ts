import { BoundKind } from "../analysis/binder/kind/bound.kind";
import { BoundCompilationUnit } from "../analysis/binder/compilation.unit";
import { BoundBinaryOperatorKind } from "../analysis/binder/kind/binary.operator.kind";
import { BoundUnaryOperatorKind } from "../analysis/binder/kind/unary.operator.kind";
import { BoundBinaryExpression } from "../analysis/binder/binary.expression";
import { BoundNumericLiteral } from "../analysis/binder/numeric.literal";
import { BoundUnaryExpression } from "../analysis/binder/unary.expression";
import { BoundNode } from "../analysis/binder/bound.node";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";

export class Evaluator {
  private value = 0;
  constructor(private diagnostics: DiagnosticsBag) {}

  evaluate<Kind extends BoundNode>(node: Kind): number {
    type NodeType<T> = Kind & T;

    switch (node.kind) {
      case BoundKind.CompilationUnit:
        return this.evaluateProgram(node as NodeType<BoundCompilationUnit>);
      case BoundKind.BinaryExpression:
        return this.evaluateBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.UnaryExpression:
        return this.evaluateUnaryExpression(node as NodeType<BoundUnaryExpression>);
      case BoundKind.NumericLiteral:
        return this.evaluateNumericLiteral(node as NodeType<BoundNumericLiteral>);
    }
    this.diagnostics.evaluatorMethod(node.kind);
    return 0;
  }

  private evaluateProgram(node: BoundCompilationUnit): number {
    for (const statement of node.statements) this.value = this.evaluate(statement);
    return this.value;
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
