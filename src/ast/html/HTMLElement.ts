import Attribute from "./Attribute";
import HTMLComponent from "./HTMLComponent";

export default class HTMLElement extends HTMLComponent {
  constructor(public tag: string, public attributes: Array<Attribute>, public children: Array<HTMLComponent>) {
    super();
  }
}
