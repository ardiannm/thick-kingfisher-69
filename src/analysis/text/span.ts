import { SourceText } from "./source.text";

export class Span {
  private constructor(private _text: SourceText, public start: number, public end: number) {}

  public static createFrom(text: SourceText, start: number, end: number) {
    return new Span(text, start, end);
  }

  public get line() {
    return this._text.getLineIndex(this.start) + 1;
  }

  public get offset() {
    return this.start - this._text.getLineSpan(this.start).start + 1;
  }

  public get text() {
    return this._text.get(this.start, this.end);
  }
}
