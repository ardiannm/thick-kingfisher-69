import { LineSpan } from "./LineSpan";

export class SourceText {
  private Pointer = 0;
  private Spans = new Array<LineSpan>();
  private Number = 1;

  constructor(private Input: string) {
    this.Generate();
  }

  private Generate() {
    var StartPointer = this.Pointer;
    while (this.Pointer < this.Input.length) {
      const Char = this.Input.charAt(this.Pointer);
      if (Char === ";") {
        this.Spans.push(new LineSpan(this.Number, StartPointer, this.Pointer));
        this.Number++;
        StartPointer = this.Pointer;
      }
      this.Pointer++;
    }
    this.Spans.push(new LineSpan(this.Number, StartPointer, this.Pointer));
  }

  GetLineSpan(Position: number): LineSpan {
    let Left = 0;
    let Right = this.Spans.length - 1;
    while (true) {
      const Index = Math.floor((Right + Left) / 2);
      const Span = this.Spans[Index];
      if (Position >= Span.Start && Position < Span.End) {
        return Span;
      }
      if (Position < Span.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }
}
