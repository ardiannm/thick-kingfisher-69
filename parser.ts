import { doesParseToAColumn, REG_CELL, REG_COLUMN } from "./services.ts";
import { Tokenizer } from "./tokenizer.ts";
import { DotToken } from "./definitions/tokens/dot.ts";
import { CloseParenthesisToken } from "./definitions/tokens/close.paranthesis.ts";
import { ColonToken } from "./definitions/tokens/colon.ts";
import { DivisionToken } from "./definitions/tokens/division.ts";
import { IdentifierToken } from "./definitions/tokens/identifier.ts";
import { MinusToken } from "./definitions/tokens/minus.ts";
import { MultiplicationToken } from "./definitions/tokens/multiplication.ts";
import { NumberToken } from "./definitions/tokens/number.ts";
import { OpenParenthesisToken } from "./definitions/tokens/open.paranthesis.ts";
import { PlusToken } from "./definitions/tokens/plus.ts";
import { AmpersandToken } from "./definitions/tokens/ampersand.ts";
import { BinaryNode } from "./definitions/nodes/binary.ts";
import { CellNode } from "./definitions/nodes/cell.ts";
import { ErrorNode } from "./definitions/nodes/error.ts";
import { ExpressionNode } from "./definitions/nodes/expression.ts";
import { IdentifierNode } from "./definitions/nodes/identifier.ts";
import { NumberNode } from "./definitions/nodes/number.ts";
import { RangeNode } from "./definitions/nodes/range.ts";
import { UnaryNode } from "./definitions/nodes/unary.ts";
import { MoveNode } from "./definitions/nodes/move.range.ts";
import { ErrorToken } from "./definitions/tokens/error.ts";


export class Parser extends Tokenizer {

  constructor(public input: string) {
    super(input);
  }

  parse() {
    try {
      if (this.input) {
        const left = this.parseProgram();
        if (this.hasMoreTokens()) {
          throw new ErrorNode("Input value is not a valid formula");
        }
        return left;
      }
      throw new ErrorNode("");
    } catch (error) {
      return error as ErrorNode;
    }
  }

  private parseProgram() {
    return this.parseMove();
  }

  private parseMove() {
    let left = this.parseAddition() as ExpressionNode;
    while (this.peekToken() instanceof AmpersandToken) {
      const operator = this.getNextToken().font + this.parseIdentifier().font;
      if (operator == "&R" || operator == "&C") {
        const right = this.parseAddition() as ExpressionNode;
        if (right instanceof ExpressionNode) {
          left = new MoveNode(left, operator, right);
          continue;
        }
        throw new ErrorNode(
          "The right hand side of an ampersand operation must be an expression",
        );
      }
      throw new ErrorNode(
        "You need to specify an 'R' or a 'C' directive to describe correctly an ampersand operation",
      );
    }
    return left;
  }

  private parseAddition() {
    let left = this.parseMultiplication() as ExpressionNode;
    while (
      this.peekToken() instanceof PlusToken ||
      this.peekToken() instanceof MinusToken
    ) {
      if (!(left instanceof ExpressionNode)) {
        throw new ErrorNode(
          "The left hand side in this binary expression must be a valid expression",
        );
      }
      const operator = this.getNextToken().font;
      const right = this.parseMultiplication();
      if (!(right instanceof ExpressionNode)) {
        throw new ErrorNode(
          "The right hand side in this binary expression must be a valid expression",
        );
      }
      left = new BinaryNode(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parseUnary();
    while (
      this.peekToken() instanceof MultiplicationToken ||
      this.peekToken() instanceof DivisionToken
    ) {
      if (!(left instanceof ExpressionNode)) {
        throw new ErrorNode(
          "The left hand side in this binary expression must be a valid expression",
        );
      }
      const operator = this.getNextToken().font;
      const right = this.parseUnary() as ExpressionNode;
      if (!(right instanceof ExpressionNode)) {
        throw new ErrorNode(
          "The right hand side in this binary expression must be a valid expression",
        );
      }
      left = new BinaryNode(left, operator, right);
    }
    return left;
  }

  private parseUnary() {
    if (
      this.peekToken() instanceof PlusToken ||
      this.peekToken() instanceof MinusToken
    ) {
      const operator = this.getNextToken().font;
      const right = this.parseUnary() as ExpressionNode;
      if (right instanceof ExpressionNode) {
        return new UnaryNode(operator, right);
      }
      throw new ErrorNode(
        "The right hand side in this unary expression must be a valid expression",
      );
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesisToken) {
      this.getNextToken();
      if (this.peekToken() instanceof CloseParenthesisToken) {
        throw new ErrorNode(
          "No expression was given within this paranthesis statement",
        );
      }
      const expression = this.parseAddition();
      if (!(this.peekToken() instanceof CloseParenthesisToken)) {
        throw new ErrorNode("Missing a closing paranthesis");
      }
      this.getNextToken();
      return expression;
    }
    return this.parseRange();
  }

  private parseRange() {
    let left = this.parseCell() as CellNode;
    if (this.peekToken() instanceof ColonToken) {
      this.getNextToken();
      let right = this.parseCell() as CellNode;
      if (left instanceof NumberNode) {
        left = new CellNode(left.font, "");
      }
      if (left instanceof IdentifierNode) {
        left = new CellNode("", left.font);
      }
      if (
        right instanceof NumberNode ||
        right instanceof IdentifierNode ||
        right instanceof CellNode
      ) {
        if (right instanceof NumberNode) {
          right = new CellNode(right.font, "");
        }
        if (right instanceof IdentifierNode) {
          if (!doesParseToAColumn(right.font)) {
            throw new ErrorNode("Cannot parse formula without a valid column");
          }
          if (!new RegExp(REG_COLUMN).test(right.font)) {
            throw new ErrorNode(
              "Did you mean '" + right.font.toUpperCase() + "'?",
            );
          }
          right = new CellNode("", right.font);
        }
        return new RangeNode(left, right);
      }
      throw new ErrorNode("Oops! Missing another reference after colon");
    }
    return left;
  }

  private parseCell() {
    const left = this.parseIdentifier();
    if (
      this.peekToken() instanceof NumberToken && left instanceof IdentifierNode
    ) {
      if (!doesParseToAColumn(left.font)) {
        throw new ErrorNode("Cannot parse formula without a valid column");
      }
      const right = this.getNextToken();
      const node = new CellNode(right.font, left.font);
      if (new RegExp(REG_CELL).test(node.font)) {
        return node;
      }
      if (new RegExp(REG_CELL).test(node.font.toUpperCase())) {
        throw new ErrorNode("Did you mean '" + node.font.toUpperCase() + "'?");
      }
      throw new ErrorNode(
        "Invalid cell reference provided. Cannot parse formula into a valid cell reference",
      );
    }
    return left;
  }

  private parseIdentifier() {
    if (this.peekToken() instanceof IdentifierToken) {
      return new IdentifierNode(this.getNextToken().font);
    }
    return this.parseFloat();
  }

  private parseFloat() {
    const left = this.parseNumber();
    if (this.peekToken() instanceof DotToken) {
      return new NumberNode(
        left.font + this.getNextToken().font + this.parseNumber().font,
      );
    }
    return left;
  }

  private parseNumber() {
    if (this.peekToken() instanceof NumberToken) {
      return new NumberNode(this.getNextToken().font);
    }
    return this.parseError();
  }

  private parseError() {
    const token = this.getNextToken();
    if (token instanceof ErrorToken) {
      return new ErrorNode(
        "Token character " + token.font +
        " found in the Lexer has not been implemented",
      );
    }
    return new ErrorNode(
      "Unknown character " + token.font + " found while parsing",
    );
  }
}
