import HTML from "./HTML";

export default class Component extends HTML {
  constructor(public selector: string, public comp: Array<Component>) {
    super();
  }
}
