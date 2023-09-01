import HTML from "./HTML";

export default class Component extends HTML {
  constructor(public selector: string, public children: Array<Component>) {
    super();
  }
}
