import { Lexer } from "./Lexer";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { CellReference, BinaryExpression, UnaryExpression, ParenthesizedExpression, RangeReference, ReferenceDeclaration } from "./CodeAnalysis/SyntaxNode";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Parser {
  private Index = 0;
  private Stack = new Set<string>(); // Set To Store Parsed Cell Text References
  private Tokens = new Array<SyntaxToken>();

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      if (!(Token.Kind === SyntaxKind.SpaceToken) && !(Token.Kind === SyntaxKind.BadToken)) {
        this.Tokens.push(Token);
      }
    } while (Token.Kind !== SyntaxKind.EOFToken);
  }

  // Get The Next Token Without Consuming It
  private PeekToken(Offset: number = 0) {
    const Index = this.Index + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  // Consume And Return The Next Token
  private NextToken() {
    const Token = this.PeekToken();
    this.Index++;
    return Token;
  }

  // Helper Method To Check If The Next Token Matches The Given Kinds
  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== this.PeekToken(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  private ExpectToken(Kind: SyntaxKind) {
    if (this.MatchToken(Kind)) return this.NextToken();
    const Token = this.PeekToken();
    console.log(`SyntaxError: Expected <${Kind}> Found <${Token.Kind}>;`);
    return new SyntaxToken(Kind, Token.Text);
  }

  // Main Parsing Method
  public Parse() {
    return this.ParseReference();
  }

  private ParseReference() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.MinusToken, SyntaxKind.Greater)) {
      this.NextToken();
      this.NextToken();
      this.Stack.clear();
      const Right = this.ParseBinary();
      const Node = new ReferenceDeclaration(SyntaxKind.ReferenceDeclaration, Left, Array.from(this.Stack), Right);
      this.Stack.clear();
      return Node;
    }
    return Left;
  }

  // Parse Expressions With Binary Operators
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

  // Parse Unary Expressions (e.g., +, -)
  private ParseUnary() {
    if (this.MatchToken(SyntaxKind.PlusToken) || this.MatchToken(SyntaxKind.MinusToken)) {
      const Operator = this.NextToken();
      const Right = this.ParseUnary();
      return new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Right);
    }
    return this.ParseParenthesis();
  }

  // Parse Expressions Enclosed In Parentheses
  private ParseParenthesis() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseBinary();
      const Right = this.ExpectToken(SyntaxKind.CloseParenToken);
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, Left, Expression, Right);
    }
    return this.ParseRange();
  }

  // Parse Range Reference (e.g., B4:C, B:E)
  private ParseRange() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCell();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  // Parse Cell Reference (e.g., A1, B7)
  private ParseCell() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      const Text = Left.Text + Right.Text;
      this.Stack.add(Text); // Add Cell Reference To The Stack Of References
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

  // Parse Literals (e.g., Numbers, Identifiers)
  private ParseLiteral() {
    if (this.MatchToken(SyntaxKind.IdentifierToken)) return this.NextToken();
    return this.ExpectToken(SyntaxKind.NumberToken);
  }
}
