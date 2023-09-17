import Attribute from "./Attribute";
import HTMLComponent from "./HTMLComponent";

export default class HTMLVoidElement extends HTMLComponent {
  constructor(public tag: string, public attributes: Array<Attribute>) {
    super();
  }
}
