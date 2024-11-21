import { Kind, SyntaxKind } from "../analysis/parsing/syntax.kind";
import { Line } from "./line";
import { Span } from "./span";

export class Token<T extends Kind = Kind> {
  constructor(public kind: T, public span: Span) {}

  isTrivia() {
    switch (this.kind) {
      case SyntaxKind.LineBreakTrivia:
      case SyntaxKind.SpaceTrivia:
      case SyntaxKind.CommentTrivia:
      case SyntaxKind.BadToken:
        return true;
      default:
        return false;
    }
  }

  isMultiLine() {
    switch (this.kind) {
      case SyntaxKind.CommentTrivia:
        return true;
      default:
        return false;
    }
  }

  getOverlapWithLine(line: Line): Token | null {
    const tokenStart = this.span.start;
    const tokenEnd = this.span.end;
    const lineStart = line.fullSpan.start;
    const lineEnd = line.fullSpan.end;
    if (tokenStart >= lineStart && tokenEnd <= lineEnd) {
      return this;
    }
    if (tokenEnd < lineStart || tokenStart > lineEnd) {
      return null;
    }
    const overlapStart = Math.max(tokenStart, lineStart);
    const overlapEnd = Math.min(tokenEnd, lineEnd);
    const overlappingSpan = Span.createFrom(line.source, overlapStart, overlapEnd);
    return new Token(this.kind, overlappingSpan);
  }
}
