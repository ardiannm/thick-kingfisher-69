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

  EndOfFileToken = "EndOfFileToken",
  BadToken = "BadToken",

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
  DeclarationStatement = "DeclarationStatement",
}

export enum OperatorKind {}
