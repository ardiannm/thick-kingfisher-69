export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}

  toString(): string {
    return `<span class="${this.scope}">${this.text
      .map((t) => {
        if (t instanceof Span) return t.toString();
        return t;
      })
      .join("")}</span>`.replace(/(><)/g, ">\n<");
  }
}
