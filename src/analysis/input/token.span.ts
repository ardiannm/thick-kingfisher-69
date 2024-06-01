import { SourceText } from "./source.text";

export class TokenSpan {
  constructor(public Input: SourceText, public Start: number, public End: number) {}

  GetText() {
    return this.Input.Text.substring(this.Start, this.End);
  }
}
