export class Cell {
  constructor(public declared: boolean) {}
}

export class BoundScope {
  values = new Map<string, Cell>();
  constructor(public parent: BoundScope | null) {}

  get(text: string) {
    if (!this.values.has(text)) {
      this.values.set(text, new Cell(false));
    }
    return this.values.get(text) as Cell;
  }
}
