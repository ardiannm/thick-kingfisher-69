export class Span {
  private constructor(public start: number, public end: number) {}

  static create(start: number, end: number) {
    return new Span(start, end)
  }

  get length() {
    return this.end - this.start
  }
}
