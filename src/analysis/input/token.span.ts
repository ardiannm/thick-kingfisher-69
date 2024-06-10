import { SourceText } from "./source.text";

export class Span {
  constructor(public input: SourceText, public start: number, public end: number) {}

  GetText() {
    return this.input.text.substring(this.start, this.end);
  }
}
