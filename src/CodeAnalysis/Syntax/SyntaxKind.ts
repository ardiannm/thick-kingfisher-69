export enum SyntaxKind {
  SpaceToken = "SpaceToken",
  CommentToken = "CommentToken",
  NewLineToken = "NewLineToken",

  IdentifierToken = "IdentifierToken",
  NumberToken = "NumberToken",

  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  SlashToken = "SlashToken",
  StarToken = "StarToken",

  ColonToken = "ColonToken",
  OpenParenToken = "OpenParenToken",
  CloseParenToken = "CloseParenToken",
  DotToken = "DotToken",
  HashToken = "HashToken",
  GreaterToken = "GreaterToken",

  EndOfFileToken = "EndOfFileToken",
  BadToken = "BadToken",

  PointerToken = "PointerToken",

  TrueKeyword = "TrueKeyword",
  FalseKeyword = "FalseKeyword",
  CopyKeyword = "CopyKeyword",

  SyntaxRoot = "SyntaxRoot",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ParenthesizedExpression = "ParenthesizedExpression",
  CellReference = "CellReference",
  RangeReference = "RangeReference",
  RefersToStatement = "RefersToStatement",
  CopyStatement = "CopyStatement",
  Program = "Program",
}
