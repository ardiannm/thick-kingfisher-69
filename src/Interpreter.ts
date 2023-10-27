import System from "./system/System";
import SystemException from "./system/SystemException";
import Program from "./ast/expressions/Program";
import Unary from "./ast/expressions/Unary";
import SyntaxToken from "./ast/tokens/SyntaxToken";
import SystemNumber from "./system/SystemNumber";
import SystemString from "./system/SystemString";
import Substraction from "./ast/expressions/Substraction";
import Multiplication from "./ast/expressions/Multiplication";
import Division from "./ast/expressions/Division";
import Number from "./ast/expressions/Number";
import Exponentiation from "./ast/expressions/Exponentiation";
import Negation from "./ast/expressions/Negation";
import String from "./ast/expressions/String";
import Cell from "./ast/spreadsheet/Cell";
import Range from "./ast/spreadsheet/Range";
import SystemCell from "./system/SystemCell";
import SystemRange from "./system/SystemRange";
import InterpreterService from "./InterpreterService";
import Addition from "./ast/expressions/Addition";
import Observable from "./ast/expressions/Observable";
import Environment from "./Environment";

const Interpreter = () => {
  const { columnToNumber } = InterpreterService();
  const environment = new Environment();

  const evaluate = <T extends SyntaxToken>(token: T): System => {
    if (token instanceof Program) return evaluateProgram(token);
    if (token instanceof Number) return evaluateNumber(token);
    if (token instanceof String) return evaluateString(token);
    if (token instanceof Unary) return evaluateUnary(token);
    if (token instanceof Addition) return evaluateAddition(token);
    if (token instanceof Substraction) return evaluateSubstraction(token);
    if (token instanceof Multiplication) return evaluateMultiplication(token);
    if (token instanceof Division) return evaluateDivision(token);
    if (token instanceof Exponentiation) return evaluateExponantiation(token);
    if (token instanceof Cell) return evaluateCell(token);
    if (token instanceof Range) return evaluateRange(token);
    if (token instanceof Observable) return evaluateObservable(token);
    throw new SystemException(`token type \`${token.type}\` has not been implemented for interpretation`);
  };

  const evaluateProgram = (token: Program) => {
    let value = new System();
    token.expressions.forEach((e) => (value = evaluate(e)));
    return value;
  };

  const evaluateNumber = (token: Number) => {
    return new SystemNumber(parseFloat(token.view));
  };

  const evaluateAddition = (token: Addition) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemString && right instanceof SystemString) {
      return new SystemString(left.value + right.value);
    }
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform addition operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value + right.value);
  };

  const evaluateSubstraction = (token: Substraction) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform substraction operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value - right.value);
  };

  const evaluateExponantiation = (token: Exponentiation) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform exponantiation operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value ** right.value);
  };

  const evaluateDivision = (token: Division) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform division operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value / right.value);
  };

  const evaluateMultiplication = (token: Multiplication) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemString && right instanceof SystemNumber) {
      return new SystemString(left.value.repeat(right.value));
    }
    if (left instanceof SystemNumber && right instanceof SystemString) {
      return new SystemString(right.value.repeat(left.value));
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform multiplication operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value * right.value);
  };

  const evaluateUnary = (token: Unary) => {
    const right = evaluate(token.right);

    if (!(right instanceof SystemNumber)) {
      return new SystemException(`can't perform unary operations over \`${right.type}\` token`);
    }

    switch (true) {
      case token instanceof Negation:
        return new SystemNumber(-right.value);
      default:
        return new SystemNumber(+right.value);
    }
  };

  const evaluateString = (token: String) => {
    return new SystemString(token.view);
  };

  const evaluateCell = (token: Cell) => {
    const row = parseFloat(token.row) || 0;
    const column = columnToNumber(token.column);
    const value = environment.getVar(token.view);
    return new SystemCell(row, column, token.view, value);
  };

  const evaluateRange = (token: Range) => {
    const left = evaluate(token.left) as SystemCell;
    const right = evaluate(token.right) as SystemCell;
    return new SystemRange(left, right);
  };

  const evaluateObservable = (token: Observable) => {
    const value = evaluate(token.value) as SystemNumber;
    const varValue = environment.assignVar(token.reference, value);
    return varValue;
  };

  return { evaluate };
};

export default Interpreter;
