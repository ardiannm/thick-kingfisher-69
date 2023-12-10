export enum SyntaxKind {
  // BasicTokens
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
  GreaterToken = "GreaterToken",
  DotToken = "DotToken",
  // KeywordTokens
  FalseKeyword = "FalseKeyword",
  TrueKeyword = "TrueKeyword",
  IsKeyword = "IsKeyword",
  // CompositeTokens
  PointerToken = "PointerToken",
  // Expressions
  SyntaxTree = "SyntaxTree",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ParenthesizedExpression = "ParenthesizedExpression",
  CellReference = "CellReference",
  RangeReference = "RangeReference",
  Declaration = "Declaration",
  // HelperTokens
  EndOfFileToken = "EndOfFileToken",
  BadToken = "BadToken",
  NewLineToken = "NewLineToken",
}
