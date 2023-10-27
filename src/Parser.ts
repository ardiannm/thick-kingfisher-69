import Addition from "./ast/expressions/Addition";
import Division from "./ast/expressions/Division";
import Exponentiation from "./ast/expressions/Exponentiation";
import Expression from "./ast/expressions/Expression";
import Identifier from "./ast/expressions/Identifier";
import Identity from "./ast/expressions/Identity";
import Multiplication from "./ast/expressions/Multiplication";
import Negation from "./ast/expressions/Negation";
import Number from "./ast/expressions/Number";
import Parenthesis from "./ast/expressions/Parenthesis";
import String from "./ast/expressions/String";
import Substraction from "./ast/expressions/Substraction";
import Minus from "./ast/operators/Minus";
import Plus from "./ast/operators/Plus";
import Power from "./ast/operators/Power";
import Product from "./ast/operators/Product";
import Slash from "./ast/operators/Slash";
import Cell from "./ast/spreadsheet/Cell";
import Range from "./ast/spreadsheet/Range";
import BadToken from "./ast/tokens/BadToken";
import Character from "./ast/tokens/Character";
import CloseParenthesis from "./ast/tokens/CloseParenthesis";
import Colon from "./ast/tokens/Colon";
import EOF from "./ast/tokens/EOF";
// import Equals from "./ast/tokens/Equals";
import OpenParenthesis from "./ast/tokens/OpenParenthesis";
import Quote from "./ast/tokens/Quote";
import Lexer from "./Lexer";
import ParserService from "./ParserService";
import Observable from "./ast/expressions/Observable";
import GreaterThan from "./ast/tokens/GreaterThan";

const Parser = (input: string) => {
  const { throwError, expect, doNotExpect, extractRefs } = ParserService();
  const { getNextToken, considerSpace, ignoreSpace, peekToken, hasMoreTokens, pointer } = Lexer(input);

  const parseObservable = () => {
    const left = parseTerm();
    if (peekToken() instanceof GreaterThan) {
      const reference = expect(left, Cell, "Parser: reference must be a spreadsheet cell");
      parseToken();
      expect(parseToken(), GreaterThan, "Parser: observing operator `>>` expected for a references");
      const start = pointer();
      const right = parseTerm();
      const formula = input.substring(start, pointer());
      const observing = extractRefs(formula);
      if (observing.has(reference.view)) throwError(`Parser: circular dependency for "${reference.view}"`);
      return new Observable(reference.view, right, observing);
    }
    return left;
  };

  const parseTerm = (): Expression => {
    const left = parseFactor();
    const token = peekToken();
    if (token instanceof Plus || token instanceof Minus) {
      expect(left, Expression, "Parser: invalid left hand side in binary expression");
      getNextToken();
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of binary expression");
      const right = expect(parseTerm(), Expression, "Parser: invalid right hand side in binary expression");
      if (token instanceof Plus) return new Addition(left, right);
      return new Substraction(left, right);
    }
    return left;
  };

  const parseFactor = (): Expression => {
    const left = parseExponent();
    const token = peekToken();
    if (token instanceof Product || token instanceof Slash) {
      expect(left, Expression, "Parser: invalid left hand side in binary expression");
      getNextToken();
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of binary expression");
      const right = expect(parseFactor(), Expression, "invalid right hand side in binary expression");
      if (token instanceof Product) return new Multiplication(left, right);
      return new Division(left, right);
    }
    return left;
  };

  const parseExponent = () => {
    let left = parseUnary();
    if (peekToken() instanceof Power) {
      getNextToken();
      expect(left, Expression, "Parser: invalid left hand side in binary expression");
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of binary expression");
      const right = expect(parseExponent(), Expression, "invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  };

  const parseUnary = (): Expression => {
    if (peekToken() instanceof Plus || peekToken() instanceof Minus) {
      const operator = getNextToken();
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of unary expression");
      const right = expect(parseUnary(), Expression, "Parser: invalid expression in unary expression");
      if (operator instanceof Plus) return new Identity(right);
      return new Negation(right);
    }
    return parseParenthesis();
  };

  const parseParenthesis = () => {
    if (peekToken() instanceof OpenParenthesis) {
      getNextToken();
      doNotExpect(peekToken(), CloseParenthesis, "Parser: parenthesis closed with no expression");
      const expression = expect(parseTerm(), Expression, "Parser: expecting expression after an open parenthesis");
      expect(getNextToken(), CloseParenthesis, "Parser: expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return parseRange();
  };

  const parseRange = () => {
    let left = parseCell();
    const parsableCell = left instanceof Cell || left instanceof Identifier || left instanceof Number;
    if (parsableCell) {
      considerSpace();
      if (peekToken() instanceof Colon) {
        getNextToken();
        if (!parsableCell) {
          throwError(`Parser: invalid left hand side for range expression`);
        }
        if (left instanceof Number) left = new Cell("", left.view);
        if (left instanceof Identifier) left = new Cell(left.view, "");
        let right = parseCell();
        doNotExpect(right, EOF, "Parser: oops! missing the right hand side for range expression");
        if (!(right instanceof Cell || right instanceof Identifier || right instanceof Number)) {
          throwError(`Parser: expecting a valid spreadsheet reference right after \`:\``);
        }
        if (right instanceof Number) right = new Cell("", right.view);
        if (right instanceof Identifier) right = new Cell(right.view, "");
        ignoreSpace();
        const leftc = left as Cell;
        const rightc = right as Cell;
        const view = leftc.column + leftc.row + ":" + rightc.column + rightc.row;
        const errorMessage = `Parser: \`${view}\` is not a valid range reference; did you mean \`${view.toUpperCase()}\`?`;
        if (leftc.column !== leftc.column.toUpperCase()) {
          throwError(errorMessage);
        }
        if (rightc.column !== rightc.column.toUpperCase()) {
          throwError(errorMessage);
        }
        return new Range(leftc, rightc);
      }
      ignoreSpace();
    }
    return left;
  };

  const parseCell = () => {
    const left = parseString() as Identifier | Number;
    if (left instanceof Identifier) {
      considerSpace();
      if (peekToken() instanceof Number) {
        const right = parseToken() as Number;
        ignoreSpace();
        const view = left.view + right.view;
        if (left.view !== left.view.toUpperCase()) {
          throwError(`Parser: \`${view}\` is not a valid cell reference; did you mean \`${view.toUpperCase()}\`?`);
        }
        return new Cell(left.view, right.view);
      }
      ignoreSpace();
    }
    return left;
  };

  const parseString = () => {
    if (peekToken() instanceof Quote) {
      getNextToken();
      let view = "";
      considerSpace();
      while (hasMoreTokens()) {
        const token = peekToken();
        if (token instanceof Quote) break;
        const character = getNextToken() as Character;
        view += character.view;
      }
      expect(getNextToken(), Quote, "Parser: expecting a closing quote for the string");
      ignoreSpace();
      return new String(view);
    }
    return parseToken();
  };

  const parseToken = () => {
    const token = getNextToken();
    if (token instanceof BadToken) throwError(`Parser: bad input character \`${token.view}\` found`);
    return token;
  };

  return { parseObservable, parseTerm, parseRange, parseCell, parseString, hasMoreTokens };
};

export default Parser;
