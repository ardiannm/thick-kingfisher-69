import CloseTag from "./CloseTag";
import Component from "./Component";
import OpenTag from "./OpenTag";

export default class Script extends Component {
  constructor(public openTag: OpenTag, public view: string, public closeTag: CloseTag) {
    super(openTag, [], closeTag);
  }
}
