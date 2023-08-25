import HTML from "./HTML";

export default class Tag extends HTML {
  constructor(public selector: string) {
    super();
  }
}
