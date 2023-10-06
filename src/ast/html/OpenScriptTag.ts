import Attribute from "./Attribute";
import Tag from "./Tag";

export default class OpenScriptTag extends Tag {
  constructor(public attributes: Array<Attribute>) {
    super();
  }
}
