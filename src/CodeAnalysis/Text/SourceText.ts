import { LineSpan } from "./LineSpan";

export class SourceText {
  constructor(private Input: string) {}

  private Pointer = 0;
  private LineSpans = new Array<LineSpan>();
  private Number = 1;

  GetLineSpans() {
    var StartPointer = this.Pointer;
    while (this.Pointer < this.Input.length) {
      const Char = this.Input.charAt(this.Pointer);
      if (Char === ";") {
        this.LineSpans.push(new LineSpan(this.Number, StartPointer, this.Pointer));
        this.Number++;
        StartPointer = this.Pointer;
      }
      this.Pointer++;
    }
    this.LineSpans.push(new LineSpan(this.Number, StartPointer, this.Pointer));
    console.log(this.Input.length);

    return this.LineSpans;
  }
}
