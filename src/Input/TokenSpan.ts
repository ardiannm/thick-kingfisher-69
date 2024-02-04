import { Submission } from "./Submission";

export class TokenSpan {
  constructor(public Input: Submission, public Start: number, public End: number) {}

  GetText() {
    return this.Input.Text.substring(this.Start, this.End);
  }
}
