import Binary from "./binary.ts";
import Division from "./division.ts";
import Multiplication from "./multiplication.ts";
import Number from "./number.ts";
import Parser from "./parser.ts";
import Program from "./program.ts";
import InterpreterError from "./interpreter.error.ts";
import RuntimeNumber from "./runtime.number.ts";
import RuntimeValue from "./runtime.value.ts";
import Token from "./token.ts";
import Unary from "./unary.ts";
import Substraction from "./substraction.ts";
import Exponentiation from "./exponentiation.ts";
import Component from "./component.ts";
import ParserError from "./parser.error.ts";

export default class Interpreter extends Parser {
  //

  public run() {
    const tree = this.parse();
    const parserErrors = this.errors.filter((e) => e instanceof ParserError);

    console.log();

    if (parserErrors.length) {
      const id = 98;
      console.log(`\u001b[38;5;${id}m`);
      parserErrors.map((e) => console.log(e.message));
      console.log("\x1b[0m");
      return;
    }

    console.log(tree);

    const runtime = this.evaluate(tree);

    return {
      errors: this.errors,
      runtime,
      parser: tree,
    };
  }

  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    if (token instanceof Component) return this.evaluateComponent(token);
    return this.log(new InterpreterError(`Token type "${token.token}" has not been implemented for interpretation`, token));
  }

  private evaluateComponent(token: Component) {
    const value = token.components.map((comp) => this.evaluate(comp));
    if (value.length == 1) return value[0];
    return value.filter((b) => !(Array.isArray(b) && b.length == 0));
  }

  private evaluateProgram(token: Program) {
    let value = new RuntimeValue();
    token.expressions.forEach((e) => (value = this.evaluate(e)));
    return value;
  }

  private evaluateNumber(token: Number) {
    return new RuntimeNumber(parseFloat(token.raw));
  }

  private evaluateBinary(token: Binary) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof RuntimeNumber) || !(right instanceof RuntimeNumber)) {
      return this.log(new InterpreterError(`Can't perform binary operations between "${token.left.token}" and "${token.right.token}" tokens`, token));
    }

    switch (true) {
      case token.operator instanceof Substraction:
        return new RuntimeNumber(left.value - right.value);
      case token.operator instanceof Multiplication:
        return new RuntimeNumber(left.value * right.value);
      case token.operator instanceof Division:
        return new RuntimeNumber(left.value / right.value);
      case token.operator instanceof Exponentiation:
        return new RuntimeNumber(left.value ** right.value);
      default:
        return new RuntimeNumber(left.value + right.value);
    }
  }

  private evaluateUnary(token: Unary) {
    const right = this.evaluate(token.right);

    if (!(right instanceof RuntimeNumber)) {
      return this.log(new InterpreterError(`Can't perform unary operation over "${token.right.constructor.name}" token`, token));
    }

    switch (true) {
      case token.operator instanceof Substraction:
        return new RuntimeNumber(-right.value);
      default:
        return new RuntimeNumber(+right.value);
    }
  }
}
