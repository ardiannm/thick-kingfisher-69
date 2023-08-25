import Attribute from "./Attribute";
import HTML from "./HTML";
import OpenTag from "./OpenTag";

export default class Component extends OpenTag {
  constructor(public selector: string, public attributes: Array<Attribute>, public children: Array<HTML>) {
    super(selector, attributes);
  }
}
