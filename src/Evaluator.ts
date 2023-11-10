import { SyntaxKind } from "./Syntax/SyntaxKind";
import { BinaryExpression, PrimaryExpression, SyntaxNode, UnaryExpression } from "./Syntax/SyntaxNode";

export class Evaluator {
  constructor() {}

  Evaluate<T extends SyntaxNode>(node: T): number {
    try {
      if (node instanceof PrimaryExpression) return this.PrimaryExpression(node);
      if (node instanceof BinaryExpression) return this.BinaryExpression(node);
      if (node instanceof UnaryExpression) return this.UnaryExpression(node);
      throw `EvaluatorError: '${node.kind}' is not implemented`;
    } catch (error) {
      return error;
    }
  }

  private PrimaryExpression(node: PrimaryExpression): number {
    switch (node.kind) {
      case SyntaxKind.NumberExpression:
        return parseFloat(node.text);
      default:
        throw `EvaluatorError: '${node.kind}' is not implemented as a primary expression`;
    }
  }

  private BinaryExpression(node: BinaryExpression): number {
    const left = this.Evaluate(node.left);
    const right = this.Evaluate(node.right);
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

  private UnaryExpression(node: UnaryExpression): number {
    const right = this.Evaluate(node.right);
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
