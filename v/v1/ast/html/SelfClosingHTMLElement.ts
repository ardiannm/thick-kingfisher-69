import Attribute from "./Attribute";
import HTMLComponent from "./HTMLComponent";

export default class SelfClosingHTMLElement extends HTMLComponent {
  constructor(public tag: string, public attributes: Array<Attribute>) {
    super();
  }
}
