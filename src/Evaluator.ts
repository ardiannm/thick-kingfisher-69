import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { BinaryExpression, CellReference, ParenthesizedExpression, ReferenceExpression, SyntaxNode, SyntaxTree, UnaryExpression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { Environment } from "./Environment";

export class Evaluator {
  constructor(private Env: Environment, public Report: Diagnostics) {}

  Evaluate<Structure extends SyntaxNode>(Node: Structure) {
    switch (Node.Kind) {
      case SyntaxKind.SyntaxTree:
        return this.SyntaxTree(Node as Structure & SyntaxTree);
      case SyntaxKind.NumberToken:
        return this.NumberToken(Node as Structure & SyntaxToken);
      case SyntaxKind.CellReference:
        return this.CellReference(Node as Structure & CellReference);
      case SyntaxKind.ReferenceExpression:
        return this.ReferenceExpression(Node as Structure & ReferenceExpression);
      case SyntaxKind.ParenthesizedExpression:
        return this.ParenthesizedExpression(Node as Structure & ParenthesizedExpression);
      case SyntaxKind.UnaryExpression:
        return this.UnaryExpression(Node as Structure & UnaryExpression);
      case SyntaxKind.BinaryExpression:
        return this.BinaryExpression(Node as Structure & BinaryExpression);
      default:
        this.Report.MissingEvaluationMethod(Node.Kind);
    }
  }

  private SyntaxTree(Node: SyntaxTree) {
    return this.Evaluate(Node.Root);
  }

  private NumberToken(Node: SyntaxToken): number {
    return parseFloat(Node.Text);
  }

  private CellReference(Node: CellReference) {
    return this.Env.GetValue(Node.Reference);
  }

  private ReferenceExpression(Node: ReferenceExpression) {
    const Reference = (Node.Reference as CellReference).Reference;
    if (Node.Referencing.includes(Reference)) this.Report.CircularDependency(Reference);
    const Value = this.Evaluate(Node.Expression);
    this.Env.SetValue(Node, Value).forEach((Node) => this.Evaluate(Node));
    return Value;
  }

  private ParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Evaluate(Node.Expression);
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
}
