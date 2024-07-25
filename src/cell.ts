import { BoundExpression } from "./analysis/binder/expression";
import { BoundKind } from "./analysis/binder/kind/bound.kind";
import { BoundNode } from "./analysis/binder/bound.node";
import { BoundNumericLiteral } from "./analysis/binder/numeric.literal";

export class Cell extends BoundNode {
  constructor(
    public override kind: BoundKind.Cell,
    public name: string,
    public declared: boolean,
    public value: number,
    public expression: BoundExpression,
    public dependencies: Map<string, Cell>,
    public subscribers: Map<string, Cell>,
    public formula: string,
    public row: number,
    public column: number
  ) {
    super(kind);
  }

  private doesReference(dependency: Cell, visited = new Set()) {
    if (visited.has(this)) return false;
    visited.add(this);
    if (this.dependencies.has(dependency.name)) return true;
    for (const dep of this.dependencies.values()) if (dep.doesReference(dependency, visited)) return true;
    return false;
  }

  public track(dependency: Cell) {
    this.dependencies.set(dependency.name, dependency);
    dependency.subscribers.set(this.name, this);
  }

  public hasCircularDependecy() {
    return this.doesReference(this);
  }

  public clearDependencies() {
    this.dependencies.forEach((dependency) => dependency.subscribers.delete(this.name));
    this.dependencies.clear();
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

  public static createFromIndex(row: number, column: number) {
    return this.columnIndexToLetter(column) + row;
  }

  public static createFrom(row: string, column: string, name: string) {
    return new Cell(BoundKind.Cell, name, false, 0, new BoundNumericLiteral(0), new Map<string, Cell>(), new Map<string, Cell>(), "0", parseFloat(row), Cell.letterToColumnIndex(column));
  }
}
