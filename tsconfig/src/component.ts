import HTML from "./html.ts";

export default class Component extends HTML {
  constructor(public identifier: string, public components: Array<HTML>, public from: number, public to: number) {
    super(from, to);
  }
}
