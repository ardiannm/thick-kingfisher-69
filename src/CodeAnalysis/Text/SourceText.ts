import { LineSpan } from "./LineSpan";

export class SourceText {
  private Index = 0;
  private Spans = new Array<LineSpan>();
  private Number = 1;

  constructor(private Input: string) {
    this.Generate();
  }

  private Generate() {
    var Start = this.Index;
    while (this.Index < this.Input.length) {
      const Char = this.Input.charAt(this.Index);
      if (Char === ";") {
        this.Spans.push(new LineSpan(this.Number, Start, this.Index));
        this.Number++;
        Start = this.Index;
      }
      this.Index++;
    }
    this.Spans.push(new LineSpan(this.Number, Start, this.Index));
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
