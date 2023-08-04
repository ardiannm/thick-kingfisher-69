import Tag from "./tag.ts";

export default class OpenTag extends Tag {
  constructor(public name: string = "", public properties: string = "") {
    super();
  }
}
