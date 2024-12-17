import { SourceText } from "../lexing/source.text";
import { Span } from "../lexing/span";
import { Token } from "../lexing/token";
import { Kind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";

export class SyntaxToken<K extends Kind = Kind> extends SyntaxNode {
  constructor(public override source: SourceText, public override kind: K, private textSpan: Span, public trivias?: Token[]) {
    super(source, kind);
  }

  override hasTrivia(): boolean {
    return !!this.trivias && this.trivias.length > 0;
  }

  override get span() {
    return this.textSpan;
  }

  override get fullSpan() {
    const start = !!this.trivias?.length ? this.trivias[0].span.start : this.span.start;
    const end = this.span.end;
    return Span.createFrom(this.source, start, end);
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }
}
