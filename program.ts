import { Program } from './index'

while (true) {
  const input = prompt('//') || ''
  const program = Program()
  const tree = program.resolve(input)

  console.log()
  console.log(tree)
  console.log()
}
