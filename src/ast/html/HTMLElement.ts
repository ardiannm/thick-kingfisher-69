import HTMLComponent from "./HTMLComponent";

export default class HTMLElement extends HTMLComponent {
  constructor(public tag: string, public children: Array<HTMLComponent>) {
    super();
  }
}
