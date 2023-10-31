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
import OpenParenthesis from "./ast/tokens/OpenParenthesis";
import Quote from "./ast/tokens/Quote";
import Lexer from "./Lexer";
import ParserService from "./ParserService";
import Reference from "./ast/expressions/Reference";
import GreaterThan from "./ast/tokens/GreaterThan";

var stack = new Set<string>();
var references = new Map<string, Reference>();

function Parser(input: string) {
  const { throwError, expect, doNotExpect } = ParserService();
  const { getNextToken, considerSpace, ignoreSpace, peekToken, hasMoreTokens } = Lexer(input);

  function parseReference() {
    const left = parseCell() as Cell;
    if (peekToken() instanceof Minus) {
      expect(left, Cell, "Parser: reference must be a spreadsheet cell");
      // if reference already exists remove this reference from all other references for no future notifications
      if (references.has(left.view)) {
        references.get(left.view).referencing.forEach((r) => {
          references.get(r).referencedBy.delete(left.view);
          console.log(`popped \`${left.view}\` from \`${r}\``);
        });
      }
      parseToken();
      considerSpace()
      expect(parseToken(), GreaterThan, "Parser: operator `->` expected");
      ignoreSpace()
      stack = new Set<string>();
      const right = parseTerm();
      // if this reference is being redefined then keep the existing references that observe it
      let by = references.has(left.view) ? references.get(left.view).referencedBy : new Set<string>();
      const token = new Reference(left.view, right, stack, by);
      // for each reference being made, register this token.name into reference
      token.referencing.forEach((r) => {
        if (r === token.reference) throwError(`Parser: circular dependancy for \`${r}\` reference`);
        if (references.has(r)) references.get(r).referencedBy.add(r);
        else throwError(`Environment: reference \`${r}\` is undefined`);
      });
      //
      stack = new Set<string>();
      references.set(token.reference, token); // register in connections
      return token;
    }
    return left;
  }

  function parseTerm(): Expression {
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
  }

  function parseFactor(): Expression {
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
  }

  function parseExponent() {
    let left = parseUnary();
    if (peekToken() instanceof Power) {
      getNextToken();
      expect(left, Expression, "Parser: invalid left hand side in binary expression");
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of binary expression");
      const right = expect(parseExponent(), Expression, "invalid right hand side in binary expression");
      left = new Exponentiation(left, right);
    }
    return left;
  }

  function parseUnary(): Expression {
    if (peekToken() instanceof Plus || peekToken() instanceof Minus) {
      const operator = getNextToken();
      doNotExpect(peekToken(), EOF, "Parser: unexpected end of unary expression");
      const right = expect(parseUnary(), Expression, "Parser: invalid expression in unary expression");
      if (operator instanceof Plus) return new Identity(right);
      return new Negation(right);
    }
    return parseParenthesis();
  }

  function parseParenthesis() {
    if (peekToken() instanceof OpenParenthesis) {
      getNextToken();
      doNotExpect(peekToken(), CloseParenthesis, "Parser: parenthesis closed with no expression");
      const expression = expect(parseTerm(), Expression, "Parser: expecting expression after an open parenthesis");
      expect(getNextToken(), CloseParenthesis, "Parser: expecting to close this parenthesis");
      return new Parenthesis(expression);
    }
    return parseRange();
  }

  function parseRange() {
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
  }

  function parseCell() {
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
        stack.add(view); // register reference
        return new Cell(left.view, right.view);
      }
      ignoreSpace();
    }
    return left;
  }

  function parseString() {
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
  }

  function parseToken() {
    const token = getNextToken();
    if (token instanceof BadToken) throwError(`Parser: bad input character \`${token.view}\` found`);
    return token;
  }

  return { parseReference, parseTerm, parseRange, parseCell, parseString, hasMoreTokens };
}

export default Parser;
