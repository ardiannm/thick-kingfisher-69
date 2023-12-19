import { SyntaxKind } from "./SyntaxKind";

export type TokenKind =
  | SyntaxKind.BadToken
  | SyntaxKind.NumberToken
  | SyntaxKind.IdentifierToken
  | SyntaxKind.SpaceToken
  | SyntaxKind.CommentToken
  | SyntaxKind.TrueKeyword
  | SyntaxKind.FalseKeyword
  | SyntaxKind.NewLineToken
  | SyntaxKind.PointerToken
  | SyntaxKind.EndOfFileToken;
