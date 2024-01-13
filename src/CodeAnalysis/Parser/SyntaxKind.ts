export enum SyntaxKind {
  // tokens

  NumberToken = "NumberToken",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  SlashToken = "SlashToken",
  StarToken = "StarToken",
  ColonToken = "ColonToken",
  OpenParenthesisToken = "OpenParenthesisToken",
  CloseParenthesisToken = "CloseParenthesisToken",
  DotToken = "DotToken",
  GreaterToken = "GreaterToken",
  HashToken = "HashToken",
  HatToken = "HatToken",

  // composite tokens

  GreaterGreaterToken = "GreaterGreaterToken",
  PointerToken = "PointerToken",

  // keywords

  TrueKeyword = "TrueKeyword",
  FalseKeyword = "FalseKeyword",

  // trivias

  CommentTrivia = "CommentTrivia",
  SpaceTrivia = "SpaceTrivia",
  LineBreakTrivia = "LineBreakTrivia",

  // syntax nodes

  Program = "Program",
  CellAssignment = "CellAssignment",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ParenthesizedExpression = "ParenthesizedExpression",
  RangeReference = "RangeReference",
  CellReference = "CellReference",
  IdentifierToken = "IdentifierToken",

  // helper tokens

  Expression = "Expression",
  EndOfFileToken = "EndOfFileToken",
  BadToken = "BadToken",
}
