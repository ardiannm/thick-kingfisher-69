import { BoundKind } from "../analysis/binder/kind/bound.kind";
import { BoundNode } from "../analysis/binder/bound.node";
import { BoundExpression } from "../analysis/binder/expression";
import { BoundNumericLiteral } from "../analysis/binder/numeric.literal";

export class Cell extends BoundNode {
  private observers = new Map<string, Cell>();
  private dependencies = new Map<string, Cell>();
  private constructor(public name: string, public value: number, public expression: BoundExpression) {
    super(BoundKind.Cell);
  }

  public track(dependency: Cell) {
    this.dependencies.set(dependency.name, dependency);
    dependency.observers.set(this.name, this);
  }

  public clearDependencies() {
    this.dependencies.forEach((dep) => dep.observers.delete(this.name));
    this.dependencies.clear();
  }

  public static createFrom(name: string) {
    const expression = new BoundNumericLiteral(0);
    return new Cell(name, expression.value, expression);
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
