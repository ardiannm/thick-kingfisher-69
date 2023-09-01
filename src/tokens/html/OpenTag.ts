import Attribute from "./Attribute";
import Tag from "./Tag";

export default class OpenTag extends Tag {
  constructor(public tagName: string, public attributes: Array<Attribute>) {
    super();
  }
}
