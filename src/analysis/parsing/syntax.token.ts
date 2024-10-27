import { Span } from "../../lexing/span";
import { SyntaxTree } from "../../syntax.tree";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { TokenTextMapper } from "./token.text.warpper";

export type TokenText<Kind extends SyntaxKind> = Kind extends keyof TokenTextMapper ? TokenTextMapper[Kind] : never;

export class SyntaxToken<T extends SyntaxKind> extends SyntaxNode {
  constructor(public override tree: SyntaxTree, public override kind: T, private tokenSpan: Span, public trivia = new Array<SyntaxToken<SyntaxKind>>()) {
    super(tree, kind);
  }

  loadTrivias(trivias: Array<SyntaxToken<SyntaxKind>>): void {
    while (trivias.length > 0) {
      this.trivia.push(trivias.shift() as SyntaxToken<SyntaxKind>);
    }
  }

  override hasTrivia(): boolean {
    return this.trivia.length > 0;
  }

  override get span() {
    return this.tokenSpan;
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }
}
