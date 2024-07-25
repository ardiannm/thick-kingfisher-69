export class TokenSpan {
  private constructor(public start: number, public end: number) {}

  public static createFrom(start: number, end: number) {
    return new TokenSpan(start, end);
  }
}
