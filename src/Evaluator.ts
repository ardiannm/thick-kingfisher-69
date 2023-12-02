import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundSyntaxTree } from "./CodeAnalysis/Binding/BoundSyntaxTree";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Evaluator {
  constructor(public Logger: Diagnostics) {}

  Evaluate<Kind extends BoundNode>(Bound: Kind): number {
    type BoundType<T> = Kind & T;

    switch (Bound.Kind) {
      case BoundKind.BoundSyntaxTree:
        return this.EvaluateSyntaxTree(Bound as BoundType<BoundSyntaxTree>);
      default:
        this.Logger.MissingEvaluationMethod(Bound.Kind);
    }
  }

  private EvaluateSyntaxTree(Bound: BoundSyntaxTree) {
    let Value: number = 0;
    if (Bound.Root.length) {
      Bound.Root.forEach((BoundExpression) => (Value = this.Evaluate(BoundExpression) as number));
      return Value;
    }
    this.Logger.EmptySyntaxForEvaluator();
  }
}
