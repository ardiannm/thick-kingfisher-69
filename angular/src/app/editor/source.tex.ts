import { LineSpan } from './line.span';

export class SourceText {
  lines = new Array<LineSpan>();

  private constructor(private text: string) {
    let start = 0;
    let position = 0;
    while (position < this.text.length) {
      const c = this.text[position];
      position++;
      if (c === '\n') {
        this.lines.push(LineSpan.createFrom(this, start, position));
        start = position;
      }
    }
  }

  static createFrom(text: string): SourceText {
    return new SourceText(text);
  }

  getLineIndex(position: number): number {
    let lower = 0;
    let upper = this.lines.length - 1;
    while (lower <= upper) {
      var index = Math.floor(lower + (upper - lower) / 2);
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

  getColumnIndex(position: number): number {
    return position - this.getLineSpan(position).start;
  }

  getLineSpan(position: number) {
    return this.lines[this.getLineIndex(position)];
  }

  getLines() {
    return this.lines;
  }

  getText(start: number, end: number): string {
    return this.text.slice(start, end);
  }
}
