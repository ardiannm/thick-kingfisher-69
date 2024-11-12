import { SourceText } from "./source.text";

export class TextSpan {
  private constructor(private sourceText: SourceText, public start: number, public end: number, public lineBreakLength: number) {}

  static createFrom(sourceText: SourceText, start: number, end: number, lineBreakLength: number) {
    return new TextSpan(sourceText, start, end, lineBreakLength);
  }

  get line() {
    return this.sourceText.getLine(this.start);
  }

  get column() {
    return this.sourceText.getColumn(this.start);
  }

  get text(): string {
    return this.sourceText.text.substring(this.start, this.end - this.lineBreakLength);
  }

  get length() {
    return this.end - this.start - this.lineBreakLength;
  }

  get fullLength() {
    return this.end - this.start;
  }
}
