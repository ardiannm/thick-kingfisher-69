import { SourceText } from "./source.text";

export class Span {
  private constructor(private text: SourceText, public start: number, public end: number) {}

  public static createFrom(text: SourceText, start: number, end: number) {
    return new Span(text, start, end);
  }

  public get line() {
    return this.text.getLineIndex(this.start) + 1;
  }

  public get offset() {
    return this.start - this.text.getLineSpan(this.start).start + 1;
  }

  getText() {
    return this.text.get(this.start, this.end);
  }
}
