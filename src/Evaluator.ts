import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";

export class Evaluator {
  constructor(public Logger: Diagnostics) {}

  Evaluate<Structure extends BoundNode>(Node: Structure) {
    switch (Node.Kind) {
      default:
        this.Logger.MissingEvaluationMethod(Node.Kind);
    }
  }
}
