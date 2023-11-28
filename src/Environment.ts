import { CellReference, ReferenceExpression, SyntaxNode } from "./CodeAnalysis/SyntaxNode";

export class Environment {
  private references = new Map<string, ReferenceExpression>();
  private values = new Map<string, number>();

  public SetValue(Node: ReferenceExpression, Value: number) {
    this.references.set(Node.Reference.Reference, Node);
    this.values.set(Node.Reference.Reference, Value);
    console.log(`Environment: Value For '${Node.Reference.Reference}' Has Been Updated.`);
    return Value;
  }

  public GetValue(Node: CellReference) {
    if (this.values.has(Node.Reference)) return this.values.get(Node.Reference);
    console.log(`EnvironmentError: Variable '${Node.Reference}' Is Undefined.`);
  }
}
