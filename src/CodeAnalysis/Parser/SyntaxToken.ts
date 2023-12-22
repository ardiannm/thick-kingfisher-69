import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export type TokenMap = {
  [SyntaxKind.PlusToken]: "+";
  [SyntaxKind.MinusToken]: "-";
  [SyntaxKind.StarToken]: "*";
  [SyntaxKind.SlashToken]: "/";
  [SyntaxKind.HatToken]: "^";
  [SyntaxKind.DotToken]: ".";
  [SyntaxKind.HashToken]: "#";
  [SyntaxKind.EndOfFileToken]: "";
  [SyntaxKind.TrueKeyword]: "true";
  [SyntaxKind.FalseKeyword]: "false";
  [SyntaxKind.PointerToken]: "->";
  [SyntaxKind.NewLineToken]: "\n";
  [SyntaxKind.IdentifierToken]: string;
  [SyntaxKind.NumberToken]: string;
  [SyntaxKind.SpaceToken]: string;
  [SyntaxKind.CommentToken]: string;
  [SyntaxKind.BadToken]: string;
};

type TokenText<T extends SyntaxKind> = T extends keyof TokenMap ? TokenMap[T] : never;

export class SyntaxToken extends SyntaxNode {
  constructor(Kind: SyntaxKind.PlusToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.MinusToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.StarToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.SlashToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.HatToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.TrueKeyword, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.FalseKeyword, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.IdentifierToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.NumberToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.SpaceToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.CommentToken, Text: TokenText<typeof Kind>);
  constructor(Kind: SyntaxKind.EndOfFileToken, Text: TokenText<typeof Kind>);

  constructor(public Kind: keyof TokenMap, public Text: TokenText<typeof Kind>) {
    super(Kind);
  }
}

export type TokenKind<T extends string> = T extends TokenMap[SyntaxKind.DotToken]
  ? SyntaxKind.DotToken
  : T extends TokenMap[SyntaxKind.TrueKeyword]
  ? SyntaxKind.TrueKeyword
  : T extends TokenMap[SyntaxKind.FalseKeyword]
  ? SyntaxKind.FalseKeyword
  : T extends string
  ? SyntaxKind.IdentifierToken
  : never;
