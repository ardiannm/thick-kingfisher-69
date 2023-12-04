import { TextLine } from "./TextLine";

export class SourceText {
  private Index = 0;
  private Spans = new Array<TextLine>();
  private Number = 1;

  constructor(private Text: string) {
    this.ParseLines();
  }

  public static From(Text: string) {
    return new SourceText(Text);
  }

  private ParseLines() {
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
  }

  GetTextLine(Position: number): TextLine {
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
}
