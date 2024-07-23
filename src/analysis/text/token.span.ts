export class TokenSpan {
  private constructor(public start: number, public end: number) {}

  static from(start: number, end: number) {
    return new TokenSpan(start, end);
  }
}
