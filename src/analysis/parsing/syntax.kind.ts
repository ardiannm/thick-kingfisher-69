export enum SyntaxKind {
  EndOfFileToken = "EndOfFileToken",
  NumberToken = "NumberToken",
  ColonToken = "ColonToken",
  OpenParenthesisToken = "OpenParenthesisToken",
  CloseParenthesisToken = "CloseParenthesisToken",
  DotToken = "DotToken",
  GreaterToken = "GreaterToken",
  HashToken = "HashToken",
  SyntaxBinaryExpression = "SyntaxBinaryExpression",
  IdentifierToken = "IdentifierToken",
  BadToken = "BadToken",
  OpenBraceToken = "OpenBraceToken",
  CloseBraceToken = "CloseBraceToken",
  SyntaxCompilationUnit = "SyntaxCompilationUnit",
  SyntaxBlock = "SyntaxBlock",
  SyntaxCellAssignment = "SyntaxCellAssignment",
  SyntaxUnaryExpression = "SyntaxUnaryExpression",
  SyntaxParenthesis = "SyntaxParenthesizedExpression",
  SyntaxCellReference = "SyntaxCellReference",
  SyntaxExpression = "Expression",
  SyntaxErrorExpression = "SyntaxErrorExpression",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  StarToken = "StarToken",
  SlashToken = "SlashToken",
  HatToken = "HatToken",
  CommentTrivia = "CommentTrivia",
  SpaceTrivia = "SpaceTrivia",
  ColonColonToken = "ColonColonToken",
  LineBreakTrivia = "LineBreakTrivia",
  QuoteToken = "QuoteToken",
}

export enum SyntaxUnaryOperatorKind {
  PlusToken,
  MinusToken,
}

export enum SyntaxBinaryOperatorKind {
  PlusToken,
  MinusToken,
  StarToken,
  SlashToken,
  HatToken,
}

export type Kind = SyntaxKind | SyntaxUnaryOperatorKind | SyntaxBinaryOperatorKind;
