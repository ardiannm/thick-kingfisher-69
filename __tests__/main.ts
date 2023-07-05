import { Parser } from "../parser.ts"


while (true) {
  const input = prompt('//') || ''
  const tree = Parser(input)
  console.log(tree)
}
