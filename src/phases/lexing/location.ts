export class Location {
  private constructor(public line: number, public column: number) {}

  static createFom(line: number, column: number) {
    return new Location(line, column)
  }

  get address() {
    return this.line + ":" + this.column
  }
}
