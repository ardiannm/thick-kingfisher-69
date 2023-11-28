import { ReferenceExpression } from "./CodeAnalysis/SyntaxNode";

export class Environment {
  private References = new Map<string, ReferenceExpression>();
  private Values = new Map<string, number>();

  public SetValue(Node: ReferenceExpression, Value: number) {
    const Reference = Node.Reference.Reference;
    this.References.set(Reference, Node);
    this.Values.set(Reference, Value);
    this.RegisterNode(Node);
    return Value;
  }

  public GetValue(Reference: string) {
    if (this.Values.has(Reference)) return this.Values.get(Reference);
    throw `EnvironmentError: Variable '${Reference}' Is Undefined.`;
  }

  private RegisterNode(Node: ReferenceExpression) {
    const Reference = Node.Reference.Reference;
    for (const r of Node.Referencing) {
      this.GetValue(r);
      const ReferencedBy = this.References.get(r).ReferencedBy;
      if (ReferencedBy.includes(Reference)) continue;
      ReferencedBy.push(Reference);
    }
  }
}
