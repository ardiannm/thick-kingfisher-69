export enum SyntaxKind {
  SpaceToken = "SpaceToken",
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

  FalseKeyword = "FalseKeyword",
  TrueKeyword = "TrueKeyword",
  IsKeyword = "IsKeyword",
  CopyKeyword = "CopyKeyword",

  SyntaxRoot = "SyntaxRoot",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ParenthesizedExpression = "ParenthesizedExpression",
  CellReference = "CellReference",
  RangeReference = "RangeReference",
  Declaration = "Declaration",

  BadToken = "BadToken",
  EndOfFileToken = "EndOfFileToken",
  CopyCell = "CopyCell",
  NewLineToken = "NewLineToken",
  CommentToken = "CommentToken"
}
