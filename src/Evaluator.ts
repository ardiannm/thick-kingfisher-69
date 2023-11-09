import { SyntaxKind } from "./Syntax/SyntaxKind";
import { BinaryExpression, PrimaryExpression, SyntaxNode, UnaryExpression } from "./Syntax/SyntaxNode";

export class Evaluator {
  constructor() {}

  evaluate<T extends SyntaxNode>(node: T): number {
    try {
      if (node instanceof PrimaryExpression) return this.evaluatePrimaryExpression(node);
      if (node instanceof BinaryExpression) return this.evaluateBinaryExpression(node);
      if (node instanceof UnaryExpression) return this.evaluateUnaryNode(node);
      throw `EvaluatorError: '${node.kind}' is not implemented`;
    } catch (error) {
      return error;
    }
  }

  private evaluatePrimaryExpression(node: PrimaryExpression): number {
    switch (node.kind) {
      case SyntaxKind.NumberExpression:
        return parseFloat(node.text);
      default:
        throw `EvaluatorError: '${node.kind}' is not implemented as a primary expression`;
    }
  }

  private evaluateBinaryExpression(node: BinaryExpression): number {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    switch (node.operator.kind) {
      case SyntaxKind.PlusToken:
        return left + right;
      case SyntaxKind.MinusToken:
        return left - right;
      case SyntaxKind.StarToken:
        return left * right;
      case SyntaxKind.SlashToken:
        return left / right;
      default:
        throw `EvaluatorError: Operation '${node.operator}' is not implemented`;
    }
  }

  private evaluateUnaryNode(node: UnaryExpression): number {
    const right = this.evaluate(node.right);
    switch (node.operator.kind) {
      case SyntaxKind.PlusToken:
        return +right;
      case SyntaxKind.MinusToken:
        return -right;
      default:
        throw `EvaluatorError: Operation '${node.operator}' is not implemented`;
    }
  }
}
