import HTML from "./HTML";
import HTMLComponent from "./HTMLComponent";

export default class HTMLProgram extends HTML {
  constructor(public expressions: Array<HTMLComponent>) {
    super();
  }
}
