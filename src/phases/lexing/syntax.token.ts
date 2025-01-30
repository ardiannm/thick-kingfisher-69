import { SourceText } from "./source.text"
import { Span } from "./span"
import { SyntaxKind } from "../parsing/syntax.kind"
import { SyntaxNode } from "../parsing/syntax.node"

export class SyntaxToken<K extends SyntaxKind = SyntaxKind> extends SyntaxNode {
  constructor(public override source: SourceText, public override kind: K, private textSpan: Span) {
    super(source, kind)
  }

  get fromLine() {
    return this.source.getLine(this.textSpan.start)
  }

  get toLine() {
    return this.source.getLine(this.textSpan.end)
  }

  get text() {
    return this.source.text.substring(this.textSpan.start, this.textSpan.end)
  }

  override hasTrivia(): boolean {
    if (this.position > 0) {
      return this.source.tokens[this.position - 1].isTrivia()
    }
    return false
  }

  get position() {
    return this.source.getTokenPosition(this.span.start)
  }

  override get span() {
    return this.textSpan
  }

  // TODO: implement this method to include the leading and trailing trivias which yet will have to be defined
  override get fullSpan() {
    return this.textSpan
  }

  override getFirstChild() {
    return this
  }

  override getLastChild() {
    return this
  }

  isTrivia() {
    switch (this.kind) {
      case SyntaxKind.LineBreakTrivia:
      case SyntaxKind.SpaceTrivia:
      case SyntaxKind.CommentTrivia:
      case SyntaxKind.BadToken:
        return true
      default:
        return false
    }
  }
}
