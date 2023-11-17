import { Lexer } from "./Lexer";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { CellReference, NumberExpression, BinaryExpression, UnaryExpression, ParenthesizedExpression, RangeReference, ReferenceDeclaration, IdentifierExpression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Parser {
  private Index = 0;
  private Stack = new Set<string>(); // Set to store parsed cell text references
  private Tokens = Array<SyntaxToken>();

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);

    while (true) {
      const Token = Tokenizer.Lex();
      this.Tokens.push(Token);
      if (Token.Kind === SyntaxKind.EOFToken) break;
    }
  }

  // Get the next token without consuming it
  private PeekToken(Offset: number = 0) {
    const Index = this.Index + Offset;
    if (Index < this.Tokens.length) return this.Tokens[Index];
    return this.Tokens[this.Tokens.length - 1];
  }

  // Helper method to check if the next token matches the given kinds
  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      const Token = this.PeekToken(Offset);
      if (Kind !== Token.Kind) return false;
      Offset++;
    }
    return true;
  }

  private Expect(Kind: SyntaxKind) {
    const Token = this.NextToken();
    if (this.MatchToken(Kind)) return Token;
    console.log(`SyntaxError: Expected <${Kind}>, matched <${Token.Kind}>`);
    return Token;
  }

  // Consume and return the next token
  private NextToken() {
    const Token = this.PeekToken();
    this.Index++;
    return Token;
  }

  // Main parsing method
  public Parse() {
    return this.ParseReference();
  }

  private ParseReference() {
    const Left = this.ParseRange();
    if (this.MatchToken(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      this.NextToken();
      this.NextToken();
      this.Stack.clear();
      const Right = this.ParseBinary();
      const Node = new ReferenceDeclaration(SyntaxKind.ReferenceDeclaration, Left, Right, Array.from(this.Stack));
      this.Stack.clear();
      return Node;
    }
    return Left;
  }

  // Parse expressions with binary operators
  private ParseBinary(ParentPrecedence = 0) {
    let Left = this.ParseUnary();
    while (true) {
      const Precedence = SyntaxFacts.OperatorPrecedence(this.PeekToken().Kind);
      if (Precedence === 0 || Precedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseBinary(Precedence);
      Left = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse unary expressions (e.g., +, -)
  private ParseUnary() {
    if (this.MatchToken(SyntaxKind.PlusToken) || this.MatchToken(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnary();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParenthesis();
  }

  // Parse expressions enclosed in parentheses
  private ParseParenthesis() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, this.NextToken(), this.ParseBinary(), this.NextToken());
    }
    return this.ParseRange();
  }

  private ParseRange() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCell();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  private ParseCell() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      const NodeReference = Left.Text + Right.Text;
      this.Stack.add(NodeReference); // add cell reference to the stack of references
      return new CellReference(SyntaxKind.CellReference, Left.Text, Right.Text);
    }
    return this.ParseNumber();
  }

  // Parse primary expressions (e.g., numbers, identifiers)
  private ParseNumber() {
    const Token = this.Expect(SyntaxKind.NumberToken);
    return new NumberExpression(SyntaxKind.NumberExpression, Token.Text);
  }
}
