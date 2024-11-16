import { SourceText } from "./source.text";

export class Span {
  constructor(protected sourceText: SourceText, public start: number, public end: number) {}

  get line() {
    return this.sourceText.getLineNumber(this.start);
  }

  get column() {
    return this.sourceText.getColumnNumber(this.start);
  }

  get text(): string {
    return this.sourceText.text.substring(this.start, this.end);
  }
}
