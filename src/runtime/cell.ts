import { BoundExpression } from "../analysis/binder/bound.expression";

export class Cell {
  public observers = new Map<string, Cell>();
  public dependencies = new Map<string, Cell>();
  private constructor(public name: string, public declared: boolean, public value: number, public evaluated: boolean, public expression: BoundExpression | null) {}

  public track(dependency: Cell) {
    this.dependencies.set(dependency.name, dependency);
    dependency.observers.set(this.name, this);
  }

  public clearDependencies() {
    this.dependencies.forEach((dep) => dep.observers.delete(this.name));
    this.dependencies.clear();
  }

  public clearObservers() {
    this.observers.forEach((obs) => obs.dependencies.delete(this.name));
    this.observers.clear();
  }

  public clearGraph() {
    this.clearDependencies();
    this.clearObservers();
  }

  public doesReference(dependency: Cell, visited = new Set()) {
    if (visited.has(this)) return false;
    visited.add(this);
    if (this.dependencies.has(dependency.name)) return true;
    for (const dep of this.dependencies.values()) if (dep.doesReference(dependency, visited)) return true;
    return false;
  }

  public static createFrom(name: string) {
    return new Cell(name, false, 0, false, null);
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
