import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { BinaryExpression, ReferenceDeclaration, SyntaxNode } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";

export class Evaluator {
  public Evaluate<Node extends SyntaxNode>(Node: Node) {
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        return this.NumberToken(Node as Node & SyntaxToken);
      case SyntaxKind.ReferenceDeclaration:
        return this.ReferenceDeclaration(Node as Node & ReferenceDeclaration);
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Node & BinaryExpression);

      default:
        console.log(`EvaluatorError: Node <${Node.Kind}> Has Not Been Implemented Yet!`);
    }
  }

  private NumberToken(Node: SyntaxToken): number {
    return parseFloat(Node.Text);
  }

  private ReferenceDeclaration(Node: ReferenceDeclaration) {
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
        console.log(`EvaluatorError: Node <${Node.Operator.Kind}> Is Not An Operator Token!`);
    }
  }
}
