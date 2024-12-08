import { SourceText } from "./source.text";

export class Span {
  private constructor(protected source: SourceText, public start: number, public end: number) {}

  static createFrom(source: SourceText, start: number, end: number) {
    return new Span(source, start, end);
  }

  get line() {
    return this.source.getLine(this.start);
  }

  get column() {
    return this.source.getColumn(this.start);
  }

  get text(): string {
    return this.source.text.substring(this.start, this.end);
  }

  get length() {
    return this.end - this.start;
  }

  get address() {
    return this.source.getLine(this.start) + ":" + this.source.getColumn(this.start);
  }
}
