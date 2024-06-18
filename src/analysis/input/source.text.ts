import { LineSpan } from "./line.span";

export class SourceText {
  private lines = new Array<LineSpan>();

  constructor(public text: string) {}

  static From(text: string): SourceText {
    return new SourceText(text);
  }

  getLineSpan(position: number): LineSpan {
    let left = 0;
    let right = this.lines.length - 1;
    var pos: number;
    while (true) {
      pos = left + Math.floor((right - left) / 2);
      const lineSpan = this.lines[pos];
      if (position >= lineSpan.start && position < lineSpan.end) {
        return lineSpan;
      }
      if (position < lineSpan.start) right = pos - 1;
      else left = pos + 1;
    }
  }
}
