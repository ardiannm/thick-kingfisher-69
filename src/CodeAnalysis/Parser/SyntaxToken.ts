import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export type TokenMap = {
  [SyntaxKind.PlusToken]: "+";
  [SyntaxKind.MinusToken]: "-";
  [SyntaxKind.StarToken]: "*";
  [SyntaxKind.SlashToken]: "/";
  [SyntaxKind.OpenParenthesisToken]: "(";
  [SyntaxKind.CloseParenthesisToken]: ")";
  [SyntaxKind.HatToken]: "^";
  [SyntaxKind.DotToken]: ".";
  [SyntaxKind.HashToken]: "#";
  [SyntaxKind.GreaterToken]: ">";
  [SyntaxKind.GreaterGreaterToken]: ">>";
  [SyntaxKind.EndOfFileToken]: "";
  [SyntaxKind.TrueKeyword]: "true";
  [SyntaxKind.FalseKeyword]: "false";
  [SyntaxKind.PointerToken]: "->";
  [SyntaxKind.NewLineToken]: "\n";
  [SyntaxKind.IdentifierToken]: string;
  [SyntaxKind.NumberToken]: `${number}`;
  [SyntaxKind.SpaceToken]: string;
  [SyntaxKind.CommentToken]: string;
  [SyntaxKind.BadToken]: string;
};

export type TokenText<T extends SyntaxKind> = T extends keyof TokenMap ? TokenMap[T] : never;

export class SyntaxToken<T extends SyntaxKind> extends SyntaxNode {
  constructor(public override Kind: T, public Text: TokenText<T>) {
    super(Kind);
  }
}
