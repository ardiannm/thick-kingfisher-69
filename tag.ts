import HTML from "./html.ts";

export default class Tag extends HTML {
  constructor(public tagName: string) {
    super();
  }
}
