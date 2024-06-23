import { LineSpan } from "./line.span";

export class Text {
  private lines = new Array<LineSpan>();

  private constructor(private text: string) {
    let start = 0;
    let position = 0;
    while (position < this.text.length) {
      var lineBreakWidth = this.getLineBreakWidth(position);
      if (lineBreakWidth === 0) {
        position++;
      } else {
        this.lines.push(LineSpan.from(this, start, position, lineBreakWidth));
        position += lineBreakWidth;
        start = position;
      }
    }
    if (position >= start) this.lines.push(LineSpan.from(this, start, position, this.getLineBreakWidth(position)));
  }

  private getLineBreakWidth(position: number): number {
    const c = this.text[position];
    const l = position + 1 >= this.text.length ? "" : this.text[position + 1];
    if (c === "\r" && l === "\n") return 2;
    if (c === "\r" || c === "\n") return 1;
    return 0;
  }

  static from(text: string): Text {
    return new Text(text);
  }

  private getLineIndex(position: number): number {
    let lower = 0;
    let upper = this.lines.length - 1;
    while (lower <= upper) {
      var index = lower + (upper - lower) / 2;
      var start = this.lines[index].start;
      if (position === start) return index;
      if (start > position) {
        upper = index - 1;
      } else {
        lower = index + 1;
      }
    }
    return lower - 1;
  }

  getLineSpan(position: number) {
    return this.lines[this.getLineIndex(position)];
  }

  get(start: number, end?: number): string {
    if (end === undefined) return this.text.charAt(start);
    return this.text.substring(start, end);
  }
}
