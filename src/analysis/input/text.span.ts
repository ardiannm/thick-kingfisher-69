export class TextSpan {
  private constructor(public start: number, public end: number) {}

  static from(start: number, end: number) {
    return new TextSpan(start, end);
  }
}
