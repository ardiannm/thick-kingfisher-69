import { Interpreter } from './definitions/interpreter'
import { Parser } from './definitions/parser'
import { toLetter } from './definitions/services'
import { RuntimeValue } from './definitions/values/value'

export function Program() {
  const interpreter = Interpreter()

  function resolve(input: string): RuntimeValue {
    const tree = Parser(input)
    return interpreter.evaluate(tree)
  }

  function parse(input: string) {
    const tree = Parser(input)
    return tree
  }

  function printId(row: number, column: number) {
    return toLetter(column) + row
  }

  return { ...interpreter, parse, resolve, toLetter, printId }
}
