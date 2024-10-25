import { SourceText } from './source.tex';

export class Span {
  private constructor(private sourceText: SourceText, public start: number, public end: number) {}

  static createFrom(sourceText: SourceText, start: number, end: number) {
    return new Span(sourceText, start, end);
  }

  get line() {
    return this.sourceText.getLineIndex(this.start) + 1;
  }

  get offset() {
    return this.start - this.sourceText.getLineSpan(this.start).start + 1;
  }

  
  get text(): string {
    return this.sourceText.getText(this.start, this.end)
  }
}
