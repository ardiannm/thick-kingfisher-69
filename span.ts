import { html as prettify } from "https://cdn.skypack.dev/js-beautify";

export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}

  toString(): string {
    let text = `<span class="${this.scope}">${this.text
      .map((t) => {
        if (t instanceof Span) return t.toString();
        return t;
      })
      .join("")}</span>`.replace(/(><)/g, ">\n<");

    const directory = "__tests__/index.html";
    text = prettify(text, { indent_size: 2, indent_with_tabs: false });
    Deno.writeFileSync(directory, new TextEncoder().encode(text));
    return text;
  }
}
