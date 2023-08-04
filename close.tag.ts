import Tag from "./tag.ts";

export default class CloseTag extends Tag {
  constructor(public name: string = "", public properties: string = "") {
    super();
  }
}
