import { Submission } from "./Submission";

export class TextSpan {
  constructor(public Input: Submission, public Start: number, public End: number) {}

  Get() {
    return this.Input.Text.substring(this.Start, this.End);
  }

  Line() {
    return this.Input.GetLineIndex(this);
  }
}
