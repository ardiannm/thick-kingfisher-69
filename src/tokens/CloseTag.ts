import Tag from "./Tag";

export default class CloseTag extends Tag {
  constructor(public selector: string) {
    super();
  }
}
