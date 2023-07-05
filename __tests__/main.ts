import { Parser } from "../parser.ts"


while (true) {
  const input = prompt('//') || ''
  const tree = new Parser(input)
  console.log(tree.parse())
}
