import { LineText } from "./LineText";

export class SourceText {
  private Index = 0;
  private Spans = new Array<LineText>();
  private Number = 1;

  constructor(public Text: string) {
    this.ParseLines();
  }

  private ParseLines() {
    let Start = this.Index;
    while (this.Index < this.Text.length) {
      const Char = this.Text.charAt(this.Index);
      if (Char === "\n") {
        this.Spans.push(new LineText(this.Number, Start, this.Index));
        this.Number++;
        Start = this.Index;
      }
      this.Index++;
    }

    this.Spans.push(new LineText(this.Number, Start, this.Index));
    return this.Spans;
  }

  GetTextLine(Position: number): LineText {
    let Left = 0;
    let Right = this.Spans.length - 1;
    while (true) {
      const Index = Left + Math.floor((Right - Left) / 2);
      const Span = this.Spans[Index];
      if (Position >= Span.Start && Position < Span.End) {
        return Span;
      }
      if (Position < Span.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }

  static From(Text: string) {
    return new SourceText(Text);
  }
}
