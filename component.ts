import HTML from "./html.ts";

export default class Component extends HTML {
  constructor(public tagName: string, public content: Array<string | Component>) {
    super();
  }
}
