import { SourceText } from "../lexing/source.text"
import { Span } from "../lexing/span"
import { SyntaxKind } from "./syntax.kind"
import { SyntaxToken } from "../lexing/syntax.token"

export abstract class SyntaxNode<K extends SyntaxKind = SyntaxKind> {
  constructor(public source: SourceText, public kind: K) {}

  abstract getFirstChild(): SyntaxToken
  abstract getLastChild(): SyntaxToken

  hasTrivia() {
    return this.getFirstChild().hasTrivia()
  }

  get span() {
    return Span.create(this.getFirstChild().span.start, this.getLastChild().span.end)
  }

  get fullSpan() {
    return Span.create(this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end)
  }

  get class() {
    return SyntaxKind[this.kind]
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s/g, "-")
      .toLowerCase()
  }

  hasDiagnostics() {
    const span = this.span
    for (const diagnostic of this.source.diagnostics.bag) {
      if ((diagnostic.span.start >= span.start && diagnostic.span.start <= span.end) || (diagnostic.span.end >= span.start && diagnostic.span.end <= span.end)) return true
    }
    return false
  }
}
