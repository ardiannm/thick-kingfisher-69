import { SourceText } from "./source.text";

export class TokenSpan {
  constructor(public Source: SourceText, public Start: number, public End: number) {}

  GetText() {
    return this.Source.Text.substring(this.Start, this.End);
  }
}
