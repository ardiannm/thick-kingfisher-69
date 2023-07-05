// import { Parser } from "../parser.ts"
import { Tokenizer } from "../token-based-parser/tokenizer.ts"


while (true) {
  const input = prompt('//') || ''
  // const tree = new Parser(input)
  // console.log(tree.parse())
  const tokens = new Tokenizer(input)
  console.log(tokens.getNextToken());
  
}
