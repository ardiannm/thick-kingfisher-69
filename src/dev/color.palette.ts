import { Colors } from "./colors";

export class ColorPalette {
  constructor(public r: number, public g: number, public b: number) {}

  private static Color(text: string, hex: string): string {
    return this.HexToColorCode(hex) + text + "\x1b[0m";
  }

  private static HexToRgb(hex: string): ColorPalette {
    const int = parseInt(hex.substring(1), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return new ColorPalette(r, g, b);
  }

  private static HexToColorCode(Hex: string) {
    const rgb = this.HexToRgb(Hex);
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }

  static Sage(text: string) {
    return this.Color(text, Colors.Sage);
  }

  static Azure(text: string) {
    return this.Color(text, Colors.Azure);
  }

  static Moss(text: string) {
    return this.Color(text, Colors.Moss);
  }

  static Turquoise(text: string) {
    return this.Color(text, Colors.Turquoise);
  }

  static Terracotta(text: string) {
    return this.Color(text, Colors.Terracotta);
  }

  static Cerulean(text: string) {
    return this.Color(text, Colors.Cerulean);
  }

  static Sandstone(text: string) {
    return this.Color(text, Colors.Sandstone);
  }

  static Teal(text: string) {
    return this.Color(text, Colors.Teal);
  }

  static Gray(text: string) {
    return this.Color(text, Colors.Gray);
  }

  static Lavender(text: string) {
    return this.Color(text, Colors.Lavender);
  }

  static Buff(text: string) {
    return this.Color(text, Colors.Buff);
  }

  static Default(text: string) {
    return text;
  }
}
