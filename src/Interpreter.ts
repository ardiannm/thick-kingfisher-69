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
import Addition from "./ast/expressions/Addition";
import InterpreterService from "./InterpreterService";
import Reference from "./ast/spreadsheet/Reference";
import Environment from "./Environment";
import SystemReference from "./system/SystemReference";

function Interpreter(environment: ReturnType<typeof Environment>) {
  const { columnToNumber } = InterpreterService();

  function evaluate<T extends SyntaxToken>(token: T): System {
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
    if (token instanceof Reference) return evaluateReference(token);
    throw new SystemException(`Interpreter: token type \`${token.type}\` has not been implemented for interpretation`);
  }

  function evaluateProgram(token: Program) {
    let value = new System();
    token.expressions.forEach((e) => (value = evaluate(e)));
    return value;
  }

  function evaluateNumber(token: Number) {
    return new SystemNumber(parseFloat(token.view));
  }

  function evaluateAddition(token: Addition) {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (left instanceof SystemString && right instanceof SystemString) {
      return new SystemString(left.value + right.value);
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform addition operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value + right.value);
  }

  function evaluateSubstraction(token: Substraction) {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform substraction operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value - right.value);
  }

  function evaluateExponantiation(token: Exponentiation) {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform exponantiation operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value ** right.value);
  }

  function evaluateDivision(token: Division) {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform division operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value / right.value);
  }

  function evaluateMultiplication(token: Multiplication) {
    let left = evaluate(token.left);
    let right = evaluate(token.right);
    if (left instanceof SystemCell) {
      left = left.value;
    }
    if (right instanceof SystemCell) {
      right = right.value;
    }
    if (left instanceof SystemString && right instanceof SystemNumber) {
      return new SystemString(left.value.repeat(right.value));
    }
    if (left instanceof SystemNumber && right instanceof SystemString) {
      return new SystemString(right.value.repeat(left.value));
    }
    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform multiplication operations between \`${left.type}\` and \`${right.type}\` tokens`);
    }
    return new SystemNumber(left.value * right.value);
  }

  function evaluateUnary(token: Unary) {
    let right = evaluate(token.right);
    if (right instanceof SystemCell) {
      right = right.value;
    }

    if (!(right instanceof SystemNumber)) {
      return new SystemException(`Interpreter: can't perform unary operations over \`${right.type}\` token`);
    }

    switch (true) {
      case token instanceof Negation:
        return new SystemNumber(-right.value);
      default:
        return new SystemNumber(+right.value);
    }
  }

  function evaluateString(token: String) {
    return new SystemString(token.view);
  }

  function evaluateCell(token: Cell) {
    const row = parseFloat(token.row) || 0;
    const column = columnToNumber(token.column);
    return new SystemCell(row, column, environment.values.get(token.view).value);
  }

  function evaluateRange(token: Range) {
    const left = evaluate(token.left) as SystemCell;
    const right = evaluate(token.right) as SystemCell;
    return new SystemRange(left, right);
  }

  function evaluateReference(token: Reference) {
    const value = evaluate(token.expression) as SystemNumber;
    const referencedBy = environment.values.has(token.reference) ? environment.values.get(token.reference).referencedBy : new Set<string>();
    environment.values.set(token.reference, new SystemReference(value, referencedBy));
    return value;
  }

  return { evaluate };
}

export default Interpreter;
