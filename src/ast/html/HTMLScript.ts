import Attribute from "./Attribute";
import HTMLComponent from "./HTMLComponent";

export default class HTMLScript extends HTMLComponent {
  public tag: string = "script";
  constructor(public view: string, public attributes: Array<Attribute>) {
    super();
  }
}
