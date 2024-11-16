import { SourceText } from "./source.text";
import { Span } from "./span";

export class LineSpan extends Span {
  private constructor(protected override sourceText: SourceText, public override start: number, public override end: number, public lineBreakLength: number) {
    super(sourceText, start, end);
  }

  static createFrom(sourceText: SourceText, start: number, end: number, lineBreakLength: number) {
    return new LineSpan(sourceText, start, end, lineBreakLength);
  }

  override get text(): string {
    return this.sourceText.text.substring(this.start, this.end - this.lineBreakLength);
  }

  get fullText(): string {
    return this.sourceText.text.substring(this.start, this.end);
  }

  override get length() {
    return this.end - this.start - this.lineBreakLength;
  }
}
