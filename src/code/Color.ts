enum Color {
  Red = `\x1b[31m`,
  Blue = `\x1b[38;2;86;156;214m`,
  White = `\x1b[0m`,
  Green = `\x1b[38;2;78;201;176m`,
  Yellow = `\x1b[38;2;215;186;125m`,
  Brown = `\x1b[38;2;206;145;120m`,
  SkyBlue = `\x1b[38;2;156;220;254m`,
  DimSkyBlue = `\x1b[38;2;62;88;128m`,
}

export const colorize = (text: string, startColor: Color, endColor = Color.White) => {
  return `${startColor}${text}${endColor}`;
};

export default Color;
