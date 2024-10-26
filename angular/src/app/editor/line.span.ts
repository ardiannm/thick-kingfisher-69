import { SourceText } from './source.tex';

export class LineSpan {
  private constructor(private sourceText: SourceText, public start: number, public end: number) {}

  static createFrom(sourceText: SourceText, start: number, end: number) {
    return new LineSpan(sourceText, start, end);
  }

  get line() {
    return this.sourceText.getLine(this.start);
  }

  get text(): string {
    return this.sourceText.getText(this.start, this.end - 1);
  }
}
