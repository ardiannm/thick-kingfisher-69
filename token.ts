import { format } from "./format.ts";
import { Primitive } from "./primitive.ts";

export class Token {
  public token = format(this.constructor.name);

  prettyPrint(indentation = "") {
    if (this instanceof Primitive) return `${this.value || "EOF"}`;

    const properties = Object.entries(this)
      .filter(([_k, v]) => v instanceof Token)
      .map(([k, v]) => `${indentation} (${k} ${v.prettyPrint(`${indentation}  `)})`);

    return `\n${properties.join("\n")}`;
  }
}
