import { SourceText } from "./source.text";

export class Span {
  private constructor(public start: number, public end: number, public text: SourceText) {}

  public static createFrom(start: number, end: number, text: SourceText) {
    return new Span(start, end, text);
  }
}
