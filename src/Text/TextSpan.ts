import { SourceText } from "./SourceText";

export class TextSpan {
  constructor(public Input: SourceText, public Start: number, public End: number) {}

  Get() {
    return this.Input.Text.substring(this.Start, this.End);
  }
}
