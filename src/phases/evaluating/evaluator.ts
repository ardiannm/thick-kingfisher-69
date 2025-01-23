import { DiagnosticsBag } from "../../diagnostics/diagnostics.bag"
import { BoundBinaryExpression } from "../binding/bound.binary.expression"
import { BoundCellAssignment } from "../binding/bound.cell.assignment"
import { BoundCellReference } from "../binding/bound.cell.reference"
import { BoundCompilationUnit } from "../binding/bound.compilation.unit"
import { BoundKind, BoundBinaryOperatorKind, BoundUnaryOperatorKind } from "../binding/bound.kind"
import { BoundNode } from "../binding/bound.node"
import { BoundNumericLiteral } from "../binding/bound.numeric.literal"
import { BoundUnaryExpression } from "../binding/bound.unary.expression"

export class Evaluator {
  private value = 0

  private constructor(private diagnostics: DiagnosticsBag) {}

  evaluate<Kind extends BoundNode>(node: Kind): number {
    switch (node.kind) {
      case BoundKind.BoundCompilationUnit:
        return this.evaluateBoundCompilationUnit(node as Kind & BoundCompilationUnit)
      case BoundKind.BoundCellAssignment:
        return this.evaluateBoundCellAssignment(node as Kind & BoundCellAssignment)
      case BoundKind.BoundCellReference:
        return this.evaluateBoundCellReference(node as Kind & BoundCellReference)
      case BoundKind.BoundBinaryExpression:
        return this.evaluateBoundBinaryExpression(node as Kind & BoundBinaryExpression)
      case BoundKind.BoundUnaryExpression:
        return this.evaluateBoundUnaryExpression(node as Kind & BoundUnaryExpression)
      case BoundKind.BoundNumericLiteral:
        return this.evaluateBoundNumericLiteral(node as Kind & BoundNumericLiteral)
    }
    this.diagnostics.reportMissingEvaluatorMethod(node.kind, node.span)
    return 0
  }

  private evaluateBoundCompilationUnit(node: BoundCompilationUnit): number {
    for (const statement of node.root) this.value = this.evaluate(statement)
    return this.value
  }

  private evaluateBoundCellAssignment(node: BoundCellAssignment) {
    this.value = node.store.value = this.evaluate(node.expression)
    return this.value
  }

  private evaluateBoundBinaryExpression(node: BoundBinaryExpression): number {
    const left = this.evaluate(node.left)
    const right = this.evaluate(node.right)
    switch (node.operatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return left + right
      case BoundBinaryOperatorKind.Subtraction:
        return left - right
      case BoundBinaryOperatorKind.Multiplication:
        return left * right
      case BoundBinaryOperatorKind.Division:
        return left / right
      case BoundBinaryOperatorKind.Exponentiation:
        return left ** right
    }
  }

  private evaluateBoundUnaryExpression(node: BoundUnaryExpression): number {
    const right = this.evaluate(node.right)
    switch (node.operatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return right
      case BoundUnaryOperatorKind.Negation:
        return -right
    }
  }

  private evaluateBoundCellReference(node: BoundCellReference): number {
    const store = node.assignment.store
    if (store.evaluated) {
      return store.value
    }
    store.value = this.evaluate(node.assignment.expression)
    return store.value
  }

  private evaluateBoundNumericLiteral(node: BoundNumericLiteral) {
    return node.value
  }
}
