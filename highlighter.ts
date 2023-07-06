import { Particle } from "./particle.ts";
import { Token } from "./token.ts";

class Span {
  constructor(public className: string, public value: string) {}
}

export class Highlighter {
  private list = new Array<Span>();

  constructor() {}

  markup() {
    return this.list
      .map((m) => `<span class="${m.className}">${m.value}</span>`)
      .join("")
      .replaceAll("</span><span", "</span>\n<span");
  }

  highlight(element: Token, parentToken = "", parentProp = ""): Highlighter {
    if (element instanceof Particle) {
      this.list.push(new Span(`${parentToken} ${parentProp} ${element.token}`, element.value));
      return this;
    }
    Object.entries(element)
      .filter(([_, v]) => v instanceof Token)
      .map(([k, v]) => this.highlight(v, element.token, k));
    return this;
  }
}
