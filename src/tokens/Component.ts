import Attribute from "./Attribute";
import OpenTag from "./OpenTag";

export default class Component extends OpenTag {
  constructor(public identifier: string, public attributes: Array<Attribute>) {
    super(identifier, attributes);
  }
}
