import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { BinaryExpression, CellReference, ParenthesizedExpression, ReferenceExpression, SyntaxNode, SyntaxTree, UnaryExpression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { Environment } from "./Environment";

export class Evaluator {
  constructor(private Env: Environment, public Report: Diagnostics) {}

  public Evaluate<Structure extends SyntaxNode>(Node: Structure) {
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
        return this.NumberToken(Node as Structure & SyntaxToken);
      case SyntaxKind.ReferenceExpression:
        return this.ReferenceExpression(Node as Structure & ReferenceExpression);
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Structure & BinaryExpression);
      case SyntaxKind.CellReference:
        return this.CellReference(Node as Structure & CellReference);
      case SyntaxKind.ParenthesizedExpression:
        return this.ParenthesizedExpression(Node as Structure & ParenthesizedExpression);
      case SyntaxKind.UnaryExpression:
        return this.UnaryExpression(Node as Structure & UnaryExpression);
      case SyntaxKind.SyntaxTree:
        return this.SyntaxTree(Node as Structure & SyntaxTree);
      default:
        this.Report.MethodNotImplemented(Node.Kind);
    }
  }

  private SyntaxTree(Node: SyntaxTree) {
    return this.Evaluate(Node.Root);
  }

  private ReferenceExpression(Node: ReferenceExpression) {
    return this.Env.SetValueForReference(Node, this.Evaluate(Node.Expression) as number);
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
        this.Report.NotAnOperator(Node.Operator.Kind);
    }
  }

  private CellReference(Node: CellReference) {
    return this.Env.GetValueFromCell(Node.Reference);
  }

  private UnaryExpression(Node: UnaryExpression) {
    const Right = this.Evaluate(Node.Right);
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return Right;
      case SyntaxKind.MinusToken:
        return -Right;
      default:
        this.Report.NotAnOperator(Node.Operator.Kind);
    }
  }

  private ParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Evaluate(Node.Expression);
  }

  private NumberToken(Node: SyntaxToken): number {
    return parseFloat(Node.Text);
  }
}
