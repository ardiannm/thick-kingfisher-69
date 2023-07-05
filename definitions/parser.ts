import { Lexer } from './lexer'
import { DotToken } from './tokens/dot'
import { CloseParenthesisToken } from './tokens/close.paranthesis'
import { ColonToken } from './tokens/colon'
import { DivisionToken } from './tokens/division'
import { IdentifierToken } from './tokens/identifier'
import { MinusToken } from './tokens/minus'
import { MultiplicationToken } from './tokens/multiplication'
import { NumberToken } from './tokens/number'
import { OpenParenthesisToken } from './tokens/open.paranthesis'
import { PlusToken } from './tokens/plus'
import { AmpersandToken } from './tokens/ampersand'
import { BinaryNode } from './nodes/binary'
import { CellNode } from './nodes/cell'
import { ErrorNode } from './nodes/error'
import { ExpressionNode } from './nodes/expression'
import { IdentifierNode } from './nodes/identifier'
import { NumberNode } from './nodes/number'
import { RangeNode } from './nodes/range'
import { UnaryNode } from './nodes/unary'
import { MoveNode } from './nodes/move.range'
import { doesParseToAColumn, REG_CELL, REG_COLUMN } from './services'
import { ErrorToken } from './tokens/error'

export function Parser(input: string) {
  const { peekToken, getNextToken, hasMoreTokens } = Lexer(input)

  function parse() {
    try {
      if (input) {
        const left = parseProgram()
        if (hasMoreTokens()) throw new ErrorNode('Input value is not a valid formula')
        return left
      }
      throw new ErrorNode('')
    } catch (error) {
      return error as ErrorNode
    }
  }

  function parseProgram() {
    return parseMove()
  }

  function parseMove() {
    let left = parseAddition() as ExpressionNode
    while (peekToken() instanceof AmpersandToken) {
      const operator = getNextToken().font + parseIdentifier().font
      if (operator == '&R' || operator == '&C') {
        const right = parseAddition() as ExpressionNode
        if (right instanceof ExpressionNode) {
          left = new MoveNode(left, operator, right)
          continue
        }
        throw new ErrorNode('The right hand side of an ampersand operation must be an expression')
      }
      throw new ErrorNode(
        "You need to specify an 'R' or a 'C' directive to describe correctly an ampersand operation"
      )
    }
    return left
  }

  function parseAddition() {
    let left = parseMultiplication() as ExpressionNode
    while (peekToken() instanceof PlusToken || peekToken() instanceof MinusToken) {
      if (!(left instanceof ExpressionNode)) {
        throw new ErrorNode(
          'The left hand side in this binary expression must be a valid expression'
        )
      }
      const operator = getNextToken().font
      const right = parseMultiplication()
      if (!(right instanceof ExpressionNode)) {
        throw new ErrorNode(
          'The right hand side in this binary expression must be a valid expression'
        )
      }
      left = new BinaryNode(left, operator, right)
    }
    return left
  }

  function parseMultiplication() {
    let left = parseUnary()
    while (peekToken() instanceof MultiplicationToken || peekToken() instanceof DivisionToken) {
      if (!(left instanceof ExpressionNode)) {
        throw new ErrorNode(
          'The left hand side in this binary expression must be a valid expression'
        )
      }
      const operator = getNextToken().font
      const right = parseUnary() as ExpressionNode
      if (!(right instanceof ExpressionNode)) {
        throw new ErrorNode(
          'The right hand side in this binary expression must be a valid expression'
        )
      }
      left = new BinaryNode(left, operator, right)
    }
    return left
  }

  function parseUnary() {
    if (peekToken() instanceof PlusToken || peekToken() instanceof MinusToken) {
      const operator = getNextToken().font
      const right = parseUnary() as ExpressionNode
      if (right instanceof ExpressionNode) {
        return new UnaryNode(operator, right)
      }
      throw new ErrorNode('The right hand side in this unary expression must be a valid expression')
    }
    return parseParanthesis()
  }

  function parseParanthesis() {
    if (peekToken() instanceof OpenParenthesisToken) {
      getNextToken()
      if (peekToken() instanceof CloseParenthesisToken) {
        throw new ErrorNode('No expression was given within this paranthesis statement')
      }
      const expression = parseAddition()
      if (!(peekToken() instanceof CloseParenthesisToken)) {
        throw new ErrorNode('Missing a closing paranthesis')
      }
      getNextToken()
      return expression
    }
    return parseRange()
  }

  function parseRange() {
    let left = parseCell() as CellNode
    if (peekToken() instanceof ColonToken) {
      getNextToken()
      let right = parseCell() as CellNode
      if (left instanceof NumberNode) {
        left = new CellNode(left.font, '')
      }
      if (left instanceof IdentifierNode) {
        left = new CellNode('', left.font)
      }
      if (
        right instanceof NumberNode ||
        right instanceof IdentifierNode ||
        right instanceof CellNode
      ) {
        if (right instanceof NumberNode) {
          right = new CellNode(right.font, '')
        }
        if (right instanceof IdentifierNode) {
          if (!doesParseToAColumn(right.font)) {
            throw new ErrorNode('Cannot parse formula without a valid column')
          }
          if (!new RegExp(REG_COLUMN).test(right.font)) {
            throw new ErrorNode("Did you mean '" + right.font.toUpperCase() + "'?")
          }
          right = new CellNode('', right.font)
        }
        return new RangeNode(left, right)
      }
      throw new ErrorNode('Oops! Missing another reference after colon')
    }
    return left
  }

  function parseCell() {
    const left = parseIdentifier()
    if (peekToken() instanceof NumberToken && left instanceof IdentifierNode) {
      if (!doesParseToAColumn(left.font)) {
        throw new ErrorNode('Cannot parse formula without a valid column')
      }
      const right = getNextToken()
      const node = new CellNode(right.font, left.font)
      if (new RegExp(REG_CELL).test(node.font)) {
        return node
      }
      if (new RegExp(REG_CELL).test(node.font.toUpperCase())) {
        throw new ErrorNode("Did you mean '" + node.font.toUpperCase() + "'?")
      }
      throw new ErrorNode(
        'Invalid cell reference provided. Cannot parse formula into a valid cell reference'
      )
    }
    return left
  }

  function parseIdentifier() {
    if (peekToken() instanceof IdentifierToken) {
      return new IdentifierNode(getNextToken().font)
    }
    return parseFloat()
  }

  function parseFloat() {
    const left = parseNumber()
    if (peekToken() instanceof DotToken) {
      return new NumberNode(left.font + getNextToken().font + parseNumber().font)
    }
    return left
  }

  function parseNumber() {
    if (peekToken() instanceof NumberToken) {
      return new NumberNode(getNextToken().font)
    }
    return parseError()
  }

  function parseError() {
    const token = getNextToken()
    if (token instanceof ErrorToken) {
      return new ErrorNode(
        'Token character ' + token.font + ' found in the Lexer has not been implemented'
      )
    }
    return new ErrorNode('Unknown character ' + token.font + ' found while parsing')
  }

  return parse()
}
