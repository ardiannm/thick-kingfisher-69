import CloseTag from "./CloseTag";
import Component from "./Component";
import OpenTag from "./OpenTag";

export default class Script extends Component {
  constructor(public view: string) {
    super(new OpenTag("script", []), [], new CloseTag("script"));
  }
}
