import { TextLine } from "./TextLine";

// SourceText class responsible for managing source code text and providing access to text lines.

export class SourceText {
  // Index to keep track of the current position in the text.
  private Index = 0;
  // Array of TextLine objects representing lines in the source text.
  private Spans = new Array<TextLine>();
  // Line number counter.
  private Number = 1;

  // Constructor that takes a string representing the source text.
  constructor(public Text: string) {
    this.ParseLines();
  }

  // Parses the source text and creates TextLine objects for each line.
  private ParseLines() {
    let Start = this.Index;
    while (this.Index < this.Text.length) {
      const Char = this.Text.charAt(this.Index);
      if (Char === "\n") {
        // Create a TextLine object for the current line.
        this.Spans.push(new TextLine(this.Number, Start, this.Index));
        this.Number++;
        Start = this.Index;
      }
      this.Index++;
    }
    // Create a TextLine object for the last line.
    this.Spans.push(new TextLine(this.Number, Start, this.Index));
    return this.Spans;
  }

  // Gets the TextLine object for a given position in the source text.
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

  // Static method to create a new SourceText instance from a string.
  static From(Text: string) {
    return new SourceText(Text);
  }
}
