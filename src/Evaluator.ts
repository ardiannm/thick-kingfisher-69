import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { SyntaxNode } from "./CodeAnalysis/SyntaxNode";

export class Evaluator {
  constructor(public Logger: Diagnostics) {}

  Evaluate<Structure extends SyntaxNode>(Node: Structure) {
    switch (Node.Kind) {
      default:
        this.Logger.MissingEvaluationMethod(Node.Kind);
    }
  }
}
