import { Colors } from "./Colors";

export class ColorPalette {
  constructor(public r: number, public g: number, public b: number) {}

  private static Color(Text: string, Hex: string): string {
    return this.HexToColorCode(Hex) + Text + "\x1b[0m";
  }

  private static HexToRgb(Hex: string): ColorPalette {
    const BingInt = parseInt(Hex.substring(1), 16);
    const r = (BingInt >> 16) & 255;
    const g = (BingInt >> 8) & 255;
    const b = BingInt & 255;
    return new ColorPalette(r, g, b);
  }

  private static HexToColorCode(Hex: string) {
    const RgbColor = this.HexToRgb(Hex);
    return `\x1b[38;2;${RgbColor.r};${RgbColor.g};${RgbColor.b}m`;
  }

  static Sage(Text: string) {
    return this.Color(Text, Colors.Sage);
  }

  static Azure(Text: string) {
    return this.Color(Text, Colors.Azure);
  }

  static Moss(Text: string) {
    return this.Color(Text, Colors.Moss);
  }

  static Turquoise(Text: string) {
    return this.Color(Text, Colors.Turquoise);
  }

  static Terracotta(Text: string) {
    return this.Color(Text, Colors.Terracotta);
  }

  static Cerulean(Text: string) {
    return this.Color(Text, Colors.Cerulean);
  }

  static Sandstone(Text: string) {
    return this.Color(Text, Colors.Sandstone);
  }

  static Teal(Text: string) {
    return this.Color(Text, Colors.Teal);
  }

  static Gray(Text: string) {
    return this.Color(Text, Colors.Gray);
  }

  static Lavender(Text: string) {
    return this.Color(Text, Colors.Lavender);
  }

  static Buff(Text: string) {
    return this.Color(Text, Colors.Buff);
  }

  static Default(Text: string) {
    return Text;
  }
}
