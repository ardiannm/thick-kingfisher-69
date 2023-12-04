import { Diagnostics } from "../Diagnostics/Diagnostics";
import { TextLine } from "./TextLine";

export class SourceText {
  private Index = 0;
  private Spans = new Array<TextLine>();
  private Number = 1;

  constructor(private Text: string, public Logger: Diagnostics) {
    this.ParseLines();
  }

  ParseLines() {
    let Start = this.Index;
    while (this.Index < this.Text.length) {
      const Char = this.Text.charAt(this.Index);
      if (Char === "\n") {
        this.Spans.push(new TextLine(this.Number, Start, this.Index));
        this.Number++;
        Start = this.Index;
      }
      this.Index++;
    }
    this.Spans.push(new TextLine(this.Number, Start, this.Index));
    return this.Spans;
  }

  GetTextLine(Position: number): TextLine {
    let Left = 0;
    let Right = this.Spans.length - 1;
    if (Position > Right) this.Logger.IndexOutOfBounds();
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
}
