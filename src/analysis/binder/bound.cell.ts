import { BoundKind } from "./kind/bound.kind";
import { BoundNode } from "./bound.node";
import { BoundExpression } from "./bound.expression";
import { BoundNumericLiteral } from "./bound.numeric.literal";

export class BoundCell extends BoundNode {
  private observers = new Map<string, BoundCell>();
  private dependencies = new Map<string, BoundCell>();

  private constructor(public name: string, public value: number, public expression: BoundExpression) {
    super(BoundKind.Cell);
  }

  public track(dependency: BoundCell) {
    this.dependencies.set(dependency.name, dependency);
    dependency.observers.set(this.name, this);
  }

  public clearDependencies() {
    this.dependencies.forEach((dep) => dep.observers.delete(this.name));
    this.dependencies.clear();
  }

  public doesReference(dependency: BoundCell, visited = new Set()) {
    if (visited.has(this)) return false;
    visited.add(this);
    if (this.dependencies.has(dependency.name)) return true;
    for (const dep of this.dependencies.values()) if (dep.doesReference(dependency, visited)) return true;
    return false;
  }

  public static createFrom(name: string) {
    const expression = new BoundNumericLiteral(0);
    return new BoundCell(name, expression.value, expression);
  }

  public static referenceFromIndex(row: number, column: number) {
    return this.columnIndexToLetter(column) + row;
  }

  public static columnIndexToLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  public static letterToColumnIndex(letter: string): number {
    let result = 0;
    for (let index = 0; index < letter.length; index++) {
      const charCode = letter.charCodeAt(index) - 65 + 1;
      result = result * 26 + charCode;
    }
    return result;
  }
}
