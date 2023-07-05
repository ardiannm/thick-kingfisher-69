import { toLetter } from '../services'

export class ReferenceValue {
  constructor(
    public left: number,
    public top: number,
    public right: number,
    public bottom: number
  ) {}

  public printFonts(bottomLimit: number, rightLimit: number) {
    const fonts: Array<string> = []

    const l = this.left ? this.left : 1
    const t = this.top ? this.top : 1
    const r = this.right ? this.right : rightLimit
    const b = this.bottom ? this.bottom : bottomLimit

    const fontLeft = toLetter(l) + t
    const fontRight = toLetter(r) + b

    fonts.push(fontLeft)
    if (this.right && this.bottom) fonts.push(fontRight)
    return fonts
  }
}
