import HTML from "./html.ts";

export default class PlainText extends HTML {
  constructor(public source: string, public from: number, public to: number) {
    super(from, to);
  }
}
