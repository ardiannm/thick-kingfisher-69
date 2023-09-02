import Attribute from "./Attribute";
import Component from "./Component";

export default class SelfEnclosingTag extends Component {
  constructor(public tag: string, public attributes: Array<Attribute>) {
    super();
  }
}
