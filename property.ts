import HTML from "./html.ts";

export default class Property extends HTML {
  constructor(public name: string, public value: string | boolean, public from: number, public to: number) {
    super(from, to);
  }
}
