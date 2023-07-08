export class Span {
  constructor(public scope: string, public content: Array<string | Span> = []) {}

  toString(): string {
    return `<span class="${this.scope}">${this.content
      .map((t) => {
        if (t instanceof Span) return t.toString();
        return t;
      })
      .join("")}</span>`.replace(/(><)/g, ">\n<");
  }
}
