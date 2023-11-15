import { SyntaxKind } from "./Syntax/SyntaxKind";
import { BinarySyntaxNode, PrimarySyntaxNode, SyntaxNode, UnarySyntaxNode } from "./Syntax/SyntaxNode";

export class Evaluator {
  constructor() {}

  Evaluate<T extends SyntaxNode>(node: T): number {
    try {
      if (node instanceof PrimarySyntaxNode) {
        return this.PrimaryExpression(node);
      } else if (node instanceof UnarySyntaxNode) {
        return this.UnaryExpression(node);
      } else if (node instanceof BinarySyntaxNode) {
        return this.BinaryExpression(node);
      }
      throw `Evaluator: '${node.Kind}' is not implemented`;
    } catch (error) {
      return error;
    }
  }

  private PrimaryExpression(node: PrimarySyntaxNode): number {
    switch (node.Kind) {
      case SyntaxKind.NumberExpression:
        return parseFloat(node.Text);
      default:
        throw `Evaluator: '${node.Kind}' is not implemented in primary expressions`;
    }
  }

  private BinaryExpression(node: BinarySyntaxNode): number {
    const left = this.Evaluate(node.Left);
    const right = this.Evaluate(node.Right);
    switch (node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return left + right;
      case SyntaxKind.MinusToken:
        return left - right;
      case SyntaxKind.StarToken:
        return left * right;
      case SyntaxKind.SlashToken:
        return left / right;
      default:
        throw `Evaluator: Operation '${node.Operator}' is not implemented`;
    }
  }

  private UnaryExpression(node: UnarySyntaxNode): number {
    const right = this.Evaluate(node.Right);
    switch (node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return +right;
      case SyntaxKind.MinusToken:
        return -right;
      default:
        throw `Evaluator: Operation '${node.Operator}' is not implemented`;
    }
  }
}
