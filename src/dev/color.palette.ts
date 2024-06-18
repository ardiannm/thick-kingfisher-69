import { Colors } from "./colors";

export class ColorPalette {
  constructor(public r: number, public g: number, public b: number) {}

  private static color(text: string, hex: string): string {
    return this.hexToColorCode(hex) + text + "\x1b[0m";
  }

  private static hexToRgb(hex: string): ColorPalette {
    const int = parseInt(hex.substring(1), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return new ColorPalette(r, g, b);
  }

  private static hexToColorCode(Hex: string) {
    const rgb = this.hexToRgb(Hex);
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }

  static sage(text: string) {
    return this.color(text, Colors.Sage);
  }

  static azure(text: string) {
    return this.color(text, Colors.Azure);
  }

  static moss(text: string) {
    return this.color(text, Colors.Moss);
  }

  static turquoise(text: string) {
    return this.color(text, Colors.Turquoise);
  }

  static terracotta(text: string) {
    return this.color(text, Colors.Terracotta);
  }

  static cerulean(text: string) {
    return this.color(text, Colors.Cerulean);
  }

  static sandstone(text: string) {
    return this.color(text, Colors.Sandstone);
  }

  static teal(text: string) {
    return this.color(text, Colors.Teal);
  }

  static gray(text: string) {
    return this.color(text, Colors.Gray);
  }

  static lavender(text: string) {
    return this.color(text, Colors.Lavender);
  }

  static buff(text: string) {
    return this.color(text, Colors.Buff);
  }

  static default(text: string) {
    return text;
  }
}
