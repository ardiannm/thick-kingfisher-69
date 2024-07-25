import { SourceText } from "./source.text";

export class LineSpan {
  private constructor(
    public text: SourceText,
    public start: number,
    public end: number,

    public lineBreakWidth: number
  ) {}

  public static createFrom(sourceText: SourceText, start: number, end: number, lineBreakWidth: number): LineSpan {
    return new LineSpan(sourceText, start, end, lineBreakWidth);
  }

  public getText() {
    return this.text.get(this.start, this.end);
  }
}
