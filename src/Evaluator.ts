import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { BinaryExpression, ParenthesizedExpression, ReferenceExpression, SyntaxNode, UnaryExpression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

export class Evaluator {
  public Evaluate<Node extends SyntaxNode>(Node: Node) {
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        return this.NumberToken(Node as Node & SyntaxToken);
      case SyntaxKind.ReferenceExpression:
        return this.ReferenceExpression(Node as Node & ReferenceExpression);
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Node & BinaryExpression);
      case SyntaxKind.ParenthesizedExpression:
        return this.ParenthesizedExpression(Node as Node & ParenthesizedExpression);
      case SyntaxKind.UnaryExpression:
        return this.UnaryExpression(Node as Node & UnaryExpression);
      default:
        console.log(`EvaluatorError: Node For Evaluating <${Node.Kind}> Is Missing.`);
    }
  }

  private NumberToken(Node: SyntaxToken): number {
    return parseFloat(Node.Text);
  }

  private ReferenceExpression(Node: ReferenceExpression) {
    return this.Evaluate(Node.Expression);
  }

  private BinaryExpression(Node: BinaryExpression) {
    const Left = this.Evaluate(Node.Left);
    const Right = this.Evaluate(Node.Right);

    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return Left + Right;
      case SyntaxKind.MinusToken:
        return Left - Right;
      case SyntaxKind.StarToken:
        return Left * Right;
      case SyntaxKind.SlashToken:
        return Left / Right;
      default:
        console.log(`EvaluatorError: Node <${Node.Operator.Kind}> Is Not An Operator Token.`);
    }
  }

  private UnaryExpression(Node: UnaryExpression) {
    const Right = this.Evaluate(Node.Right);

    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return Right;
      case SyntaxKind.MinusToken:
        return -Right;
      default:
        console.log(`EvaluatorError: Node <${Node.Operator.Kind}> Is Not An Operator Token.`);
    }
  }

  private ParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Evaluate(Node.Expression);
  }
}
