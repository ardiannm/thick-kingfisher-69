import { Text } from "./text";

export class LineSpan {
  private constructor(
    public text: Text,
    public start: number,
    public end: number,

    public lineBreakWidth: number
  ) {}

  static from(sourceText: Text, start: number, end: number, lineBreakWidth: number): LineSpan {
    return new LineSpan(sourceText, start, end, lineBreakWidth);
  }

  getText() {
    return this.text.get(this.start, this.end);
  }
}
