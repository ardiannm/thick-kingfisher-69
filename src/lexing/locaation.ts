export class Location {
  constructor(public line: number, public column: number) {}

  get address() {
    return this.line + ":" + this.column;
  }
}
