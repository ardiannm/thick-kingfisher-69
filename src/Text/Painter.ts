enum Color {
  Turquoise = "#4ec9b0",
  Terracotta = "#ce9178",
  Moss = "#6a9955",
  Buff = "#dcdcaa",
  Azure = "#569cd6",
  Sage = "#b5cea8",
  Teal = "#19c37d",
  Cerulean = "#9cdcfe",
  Sandstone = "#d7ba7d",
  Gray = "#404040",
  Lavender = "#c586c0",
}

export class Painter {
  constructor(public r: number, public g: number, public b: number) {}

  private static Color(Text: string, Hex: string): string {
    return this.HexToColorCode(Hex) + Text + "\x1b[0m";
  }

  private static HexToRgb(Hex: string): Painter {
    const BingInt = parseInt(Hex.substring(1), 16);
    const r = (BingInt >> 16) & 255;
    const g = (BingInt >> 8) & 255;
    const b = BingInt & 255;
    return new Painter(r, g, b);
  }

  private static HexToColorCode(Hex: string) {
    const RgbColor = this.HexToRgb(Hex);
    return `\x1b[38;2;${RgbColor.r};${RgbColor.g};${RgbColor.b}m`;
  }

  static Sage(Text: string) {
    return this.Color(Text, Color.Sage);
  }

  static Azure(Text: string) {
    return this.Color(Text, Color.Azure);
  }

  static Moss(Text: string) {
    return this.Color(Text, Color.Moss);
  }

  static Turquoise(Text: string) {
    return this.Color(Text, Color.Turquoise);
  }

  static Terracotta(Text: string) {
    return this.Color(Text, Color.Terracotta);
  }

  static Cerulean(Text: string) {
    return this.Color(Text, Color.Cerulean);
  }

  static Sandstone(Text: string) {
    return this.Color(Text, Color.Sandstone);
  }

  static Teal(Text: string) {
    return this.Color(Text, Color.Teal);
  }

  static Gray(Text: string) {
    return this.Color(Text, Color.Gray);
  }

  static Lavender(Text: string) {
    return this.Color(Text, Color.Lavender);
  }

  static Buff(Text: string) {
    return this.Color(Text, Color.Buff);
  }

  static Default(Text: string) {
    return Text;
  }
}
