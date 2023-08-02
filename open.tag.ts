import Tag from "./tag.ts";

export default class OpenTag extends Tag {
  constructor(public tagName: string) {
    super();
  }
}
