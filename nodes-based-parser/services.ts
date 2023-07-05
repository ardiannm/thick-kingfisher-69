export const REG_ROW = '[1-9][0-9]*'
export const REG_COLUMN = '[A-Z]+'
export const REG_CELL = `${REG_COLUMN}${REG_ROW}`
export const REG_RANGE = `^(${REG_CELL}|${REG_ROW}|${REG_COLUMN}):(${REG_CELL}|${REG_ROW}|${REG_COLUMN})$`

export function doesParseToAColumn(font: string) {
  const charCodes = font.split('').map((char) => char.charCodeAt(0))
  // Check that each subsequent character code is greater than the previous one
  return charCodes.every(function (code, index) {
    if (index === 0) return true
    return code >= charCodes[index - 1]
  })
}

export function toLetter(number: number) {
  let identifier = ''
  let value = number
  while (value > 0) {
    const remainder = (value - 1) % 26
    identifier = String.fromCharCode('A'.charCodeAt(0) + remainder) + identifier
    value = Math.floor((value - remainder) / 26)
  }
  return identifier
}

export function toNumber(letter: string) {
  let number = 0
  for (let i = 0; i < letter.length; i++) {
    const charCode = letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1
    number = number * 26 + charCode
  }
  return number.toString()
}

export type Renderer = {
  left: number
  top: number
  width: number
  height: number
}

export const computeSelection = (props: Array<Renderer>): Renderer => {
  if (!props) return { width: 0, height: 0, top: 0, left: 0 }
  const minLeft = Math.min(...props.map((r) => r.left))
  const minTop = Math.min(...props.map((r) => r.top))
  const maxLeft = Math.max(...props.map((r) => r.left + r.width))
  const maxTop = Math.max(...props.map((r) => r.top + r.height))
  return { left: minLeft, top: minTop, width: maxLeft - minLeft, height: maxTop - minTop }
}
