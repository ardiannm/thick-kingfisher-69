import Color, { colorize } from "../../services/Color";

export default class SyntaxToken {
  public type = this.constructor.name;

  toString(indent: string = colorize(".", Color.DimSkyBlue)) {
    let str = "";
    for (const prop of Object.getOwnPropertyNames(this)) {
      if (prop === "type") {
        str += `${indent} ${colorize(this.type, Color.Blue)}`;
        continue;
      }
      if (this[prop] instanceof SyntaxToken) str += `\n${indent}${this[prop].toString(indent + indent)}`;
      else if (Array.isArray(this[prop])) this[prop].forEach((p: SyntaxToken) => (str += `\n${indent}${p.toString(indent)}`));
      else str += ` // ${this[prop]}`;
    }
    return str;
  }
}
