import { format } from "./format.ts";
import { Primitive } from "./primitive.ts";

export class Token {
  public type = format(this.constructor.name);

  toString(indentation = "") {
    if (this instanceof Primitive) return `${this.literal}`;

    const properties = Object.entries(this)
      .filter(([_k, v]) => v instanceof Token)
      .map(([k, v]) => `${indentation} (${k} ${v.toString(`${indentation}  `)})`);

    return `\n${properties.join("\n")}`;
  }
}
