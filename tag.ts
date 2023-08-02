import HTML from "./html.ts";

export default class Tag extends HTML {
  constructor(public raw: string) {
    super();
  }
}
