import { BoundCell } from "./CodeAnalysis/Binding/BoundCell";
import { BoundExpression } from "./CodeAnalysis/Binding/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";

export class Environment {
  private Documents = new Map<string, BoundCell>();
  private Diagnostics: DiagnosticBag = new DiagnosticBag();

  private Has(Name: string): boolean {
    return this.Documents.has(Name);
  }

  private Get(Name: string): BoundCell {
    if (this.Has(Name)) {
      return this.Documents.get(Name) as BoundCell;
    }
    throw this.Diagnostics.DocumentDoesNotExist(Name);
  }

  Assign(Name: string, Value: number, Expression: BoundExpression) {
    this.Documents.set(Name, new BoundCell(BoundKind.BoundCell, Name, Value, Expression, new Set<string>(), new Set<string>()));
  }

  GetValue(Name: string): number {
    try {
      return this.Get(Name).Value;
    } catch (error) {
      throw this.Diagnostics.HasNeverBeenAssigned(Name);
    }
  }

  private *DetectForChange(Node: BoundCell, ForChange: Set<string>): Generator<BoundCell> {
    for (const Name of Node.Dependents) {
      if (ForChange.has(Name)) continue;
      ForChange.add(Name);
      const NextNode = this.Get(Name);
      yield NextNode;
      yield* this.DetectForChange(NextNode, ForChange);
    }
    ForChange.clear();
  }
}
