import HTML from "./html.ts";

export default class Component extends HTML {
  constructor(public tag: string, public children: Array<string | Component>) {
    super();
  }
}
