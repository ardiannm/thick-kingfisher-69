import { SyntaxKind } from "./Syntax/SyntaxKind";
import { BinaryNode, NumberNode, SyntaxNode, UnaryNode } from "./Syntax/SyntaxNode";

export class Evaluator {
  constructor() {}

  evaluate<T extends SyntaxNode>(node: T): number {
    try {
      if (node instanceof NumberNode) return this.evaluateNumberNode(node);
      if (node instanceof BinaryNode) return this.evaluateBinaryNode(node);
      if (node instanceof UnaryNode) return this.evaluateUnaryNode(node);
      throw `EvaluatorError: '${node.kind}' is not implemented`;
    } catch (error) {
      return error;
    }
  }

  private evaluateNumberNode(node: NumberNode): number {
    return parseFloat(node.repr);
  }

  private evaluateBinaryNode(node: BinaryNode): number {
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

  private evaluateUnaryNode(node: UnaryNode): number {
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
