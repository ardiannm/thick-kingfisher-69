import { SourceText } from './source.text';

export class LineSpan {
  private constructor(private sourceText: SourceText, public start: number, public end: number, public lineBreakLength: number) {}

  static createFrom(sourceText: SourceText, start: number, end: number, lineBreakLength: number) {
    return new LineSpan(sourceText, start, end, lineBreakLength);
  }

  get line() {
    return this.sourceText.getLine(this.start);
  }

  get text(): string {
    return this.sourceText.getText(this.start, this.end - this.lineBreakLength);
  }

  get length() {
    return this.end - this.start;
  }
}
