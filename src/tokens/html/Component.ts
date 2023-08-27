import CloseTag from "./CloseTag";
import HTML from "./HTML";
import OpenTag from "./OpenTag";

export default class Component extends HTML {
  constructor(public openTag: OpenTag, public children: Array<Component>, public closeTag: CloseTag) {
    super();
  }
}
