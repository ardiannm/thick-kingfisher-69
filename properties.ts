import HTML from "./html.ts";

export default class Properties extends HTML {
  constructor(public raw: string, public from: number, public to: number) {
    super(from, to);
  }
}
