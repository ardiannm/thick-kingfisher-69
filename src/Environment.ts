import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { CellReference, ReferenceDeclaration } from "./CodeAnalysis/SyntaxNode";

export class Environment {
  constructor(private Report: Diagnostics) {}

  private References = new Map<string, ReferenceDeclaration>();
  private Values = new Map<string, number>();

  GetValue(Reference: string) {
    if (this.Values.has(Reference)) return this.Values.get(Reference);
    this.Report.UndeclaredVariable(Reference);
  }

  SetValue(Node: ReferenceDeclaration, Value: number): Array<ReferenceDeclaration> {
    const Reference = (Node.Left as CellReference).Reference;

    // Check For Circular Dependency
    this.CheckDependency(Reference, Node.Referencing);

    // If This Node Has Already Been Stored Than There Might Be Existing Observers That Must Be Kept
    if (this.References.has(Reference)) {
      const Current = this.References.get(Reference);

      // Copy The Observers Before Updating The Node Structure
      Node.ReferencedBy = Current.ReferencedBy;

      // Remove The Reference From The Nodes That The Node Is Not Referring To Anymore
      Current.Referencing.forEach((Ref) => {
        if (Node.Referencing.includes(Ref)) return;
        const Subject = this.References.get(Ref);
        Subject.ReferencedBy = Subject.ReferencedBy.filter((Ref) => Ref !== Reference);
      });
    }

    // Update the Node Structure And Value
    this.References.set(Reference, Node);
    this.Values.set(Reference, Value);

    // Save The Node Structure To The Nodes That This Node Is Referencing
    Node.Referencing.forEach((Ref) => {
      const Subject = this.References.get(Ref);
      if (!Subject.ReferencedBy.includes(Reference)) Subject.ReferencedBy.push(Reference);
    });

    // Return The Nodes That This Node Is Referenced By So That They Can Be Updated By The Evaluator
    return Node.ReferencedBy.map((Ref) => this.References.get(Ref));
  }

  private CheckDependency(Reference: string, Referencing: Array<string>) {
    if (Referencing.includes(Reference)) this.Report.CircularDependency(Reference);
    Referencing.forEach((Ref) => this.CheckDependency(Reference, this.References.get(Ref).Referencing));
  }
}
