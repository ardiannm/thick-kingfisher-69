import { SourceText } from "./source.text";

export class Span {
  private constructor(private text: SourceText, public start: number, public end: number) {}

  public static createFrom(text: SourceText, start: number, end: number) {
    return new Span(text, start, end);
  }

  public get line() {
    return this.text.getLine(this.start);
  }

  public get offset() {
    return this.start - this.text.getLineSpan(this.start).start + 1;
  }
}
