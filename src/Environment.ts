import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { ReferenceExpression } from "./CodeAnalysis/SyntaxNode";

export class Environment {
  constructor(private Report: Diagnostics) {}

  private References = new Map<string, ReferenceExpression>();
  private Values = new Map<string, number>();

  GetValue(Reference: string) {
    if (this.Values.has(Reference)) return this.Values.get(Reference);
    this.Report.UndeclaredVariable(Reference);
  }

  SetValue(Node: ReferenceExpression, Value: number): Array<ReferenceExpression> {
    const Reference = Node.Reference.Reference;

    // If This Node Has Been Already Saved Than There Are Existing Observers That Must Be Kept
    // Copy The Observing Node References Before Updating The Node Structure
    if (this.References.has(Reference)) Node.ReferencedBy = this.References.get(Reference).ReferencedBy;

    this.References.set(Reference, Node);
    this.Values.set(Reference, Value);

    // Save The Node Structure To The Nodes That This Node Is Referencing
    Node.Referencing.forEach((r) => {
      const Subject = this.References.get(r);
      if (!Subject.ReferencedBy.includes(Reference)) Subject.ReferencedBy.push(Reference);
    });

    // Return The Nodes That This Node Is Referenced By So They Can Be Updated By The Evaluator
    return Node.ReferencedBy.map((r) => this.References.get(r));
  }
}
